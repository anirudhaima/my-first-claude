import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import App from '../App'

describe('App — To-Do List', () => {
  // Re-render a fresh App before each test so state never leaks between tests.
  beforeEach(() => {
    render(<App />)
  })

  // ─── Initial render ────────────────────────────────────────────────────────

  describe('initial render', () => {
    it('renders the "To-Do" heading', () => {
      expect(screen.getByRole('heading', { name: /to-?do/i })).toBeInTheDocument()
    })

    it('renders the text input with placeholder text', () => {
      expect(screen.getByPlaceholderText('Add a task...')).toBeInTheDocument()
    })

    it('renders the Add button', () => {
      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
    })

    it('shows the empty-state message when no todos exist', () => {
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument()
    })

    it('renders no list items initially', () => {
      expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    })
  })

  // ─── Adding todos ──────────────────────────────────────────────────────────

  describe('addTodo — via button click', () => {
    it('adds a new todo item to the list', async () => {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), 'Buy groceries')
      await user.click(screen.getByRole('button', { name: /add/i }))

      expect(screen.getByText('Buy groceries')).toBeInTheDocument()
    })

    it('clears the input field after adding a todo', async () => {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), 'Buy groceries')
      await user.click(screen.getByRole('button', { name: /add/i }))

      expect(screen.getByPlaceholderText('Add a task...')).toHaveValue('')
    })

    it('hides the empty-state message once a todo is added', async () => {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), 'Buy groceries')
      await user.click(screen.getByRole('button', { name: /add/i }))

      expect(screen.queryByText('No tasks yet.')).not.toBeInTheDocument()
    })

    it('can add multiple todos and shows all of them', async () => {
      const user = userEvent.setup()
      const input = screen.getByPlaceholderText('Add a task...')
      const addButton = screen.getByRole('button', { name: /add/i })

      await user.type(input, 'First task')
      await user.click(addButton)
      await user.type(input, 'Second task')
      await user.click(addButton)

      expect(screen.getByText('First task')).toBeInTheDocument()
      expect(screen.getByText('Second task')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })
  })

  describe('addTodo — via Enter key', () => {
    it('adds a todo when Enter is pressed in the input', async () => {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), 'Walk the dog{Enter}')

      expect(screen.getByText('Walk the dog')).toBeInTheDocument()
    })

    it('clears the input after adding via Enter', async () => {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), 'Walk the dog{Enter}')

      expect(screen.getByPlaceholderText('Add a task...')).toHaveValue('')
    })
  })

  describe('addTodo — empty / whitespace-only input', () => {
    it('does not add a todo when the input is empty', async () => {
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: /add/i }))

      expect(screen.queryAllByRole('listitem')).toHaveLength(0)
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument()
    })

    it('does not add a todo when the input contains only whitespace', async () => {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), '   ')
      await user.click(screen.getByRole('button', { name: /add/i }))

      expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    })

    it('does not add a todo when Enter is pressed with only whitespace', async () => {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), '   {Enter}')

      expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    })
  })

  // ─── Toggling todos ────────────────────────────────────────────────────────

  describe('toggleTodo', () => {
    // Helper: add a single todo and return the checkbox for it.
    async function addTodoAndGetCheckbox(text) {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), text)
      await user.click(screen.getByRole('button', { name: /add/i }))
      // The checkbox has no explicit label; we locate it via its sibling text.
      return screen.getByRole('checkbox')
    }

    it('marks a todo as done when its checkbox is checked', async () => {
      const checkbox = await addTodoAndGetCheckbox('Exercise')
      const user = userEvent.setup()
      await user.click(checkbox)

      expect(checkbox).toBeChecked()
    })

    it('applies the "done" class to the list item when toggled', async () => {
      await addTodoAndGetCheckbox('Exercise')
      const user = userEvent.setup()
      await user.click(screen.getByRole('checkbox'))

      // The <li> is the listitem role element.
      expect(screen.getByRole('listitem')).toHaveClass('done')
    })

    it('unchecks a todo that was previously marked done', async () => {
      await addTodoAndGetCheckbox('Exercise')
      const user = userEvent.setup()
      // Check then uncheck.
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('checkbox'))

      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    it('removes the "done" class when a todo is unchecked', async () => {
      await addTodoAndGetCheckbox('Exercise')
      const user = userEvent.setup()
      await user.click(screen.getByRole('checkbox'))
      await user.click(screen.getByRole('checkbox'))

      expect(screen.getByRole('listitem')).not.toHaveClass('done')
    })

    it('toggling one todo does not affect sibling todos', async () => {
      const user = userEvent.setup()
      const input = screen.getByPlaceholderText('Add a task...')
      const addButton = screen.getByRole('button', { name: /add/i })

      await user.type(input, 'Task A')
      await user.click(addButton)
      await user.type(input, 'Task B')
      await user.click(addButton)

      const [checkboxA] = screen.getAllByRole('checkbox')
      await user.click(checkboxA)

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).not.toBeChecked()
    })
  })

  // ─── Deleting todos ────────────────────────────────────────────────────────

  describe('deleteTodo', () => {
    it('removes a todo when its delete button is clicked', async () => {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), 'Exercise')
      await user.click(screen.getByRole('button', { name: /add/i }))

      // The delete button is rendered with the ✕ character.
      await user.click(screen.getByRole('button', { name: '✕' }))

      expect(screen.queryByText('Exercise')).not.toBeInTheDocument()
    })

    it('shows the empty-state message again after all todos are deleted', async () => {
      const user = userEvent.setup()
      await user.type(screen.getByPlaceholderText('Add a task...'), 'Exercise')
      await user.click(screen.getByRole('button', { name: /add/i }))

      await user.click(screen.getByRole('button', { name: '✕' }))

      expect(screen.getByText('No tasks yet.')).toBeInTheDocument()
    })

    it('only removes the targeted todo when multiple todos exist', async () => {
      const user = userEvent.setup()
      const input = screen.getByPlaceholderText('Add a task...')
      const addButton = screen.getByRole('button', { name: /add/i })

      await user.type(input, 'Keep this')
      await user.click(addButton)
      await user.type(input, 'Delete this')
      await user.click(addButton)

      // There are now two ✕ buttons; click the second one (index 1).
      const deleteButtons = screen.getAllByRole('button', { name: '✕' })
      await user.click(deleteButtons[1])

      expect(screen.getByText('Keep this')).toBeInTheDocument()
      expect(screen.queryByText('Delete this')).not.toBeInTheDocument()
    })
  })
})
