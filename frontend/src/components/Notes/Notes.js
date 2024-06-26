import React from 'react'
import './Notes.css'
import Note from './Note/Note'
import NewNote from './NewNote/NewNote'
import Modal from 'react-modal'
import EditNote from '../EditNote/EditNote'
import axios from '../../axios'
import {NotificationContainer, NotificationManager} from 'react-notifications'
import 'react-notifications/lib/notifications.css'

class Notes extends React.Component {
	constructor(props) {
		super(props)

		this.state = {
			notes: [],
			showEditModal: false,
			editNote: {}
		}
	}

	componentDidMount(){
		this.fetchNotes()
		Modal.setAppElement('#root');
	}
	async fetchNotes() {
		const res = await axios.get('/notes')
		const notes = res.data
		this.setState({notes})
	}

	async deleteNote(_id) {
		console.log('usuwanie notatki', _id)
		const notes = [...this.state.notes]
			.filter(note => note._id !== _id)

		await axios.delete('/notes/' + _id)
		this.setState({ notes })
	}

	async addNote(note) {
		const notes = [...this.state.notes]
		//W ceu walidacji, wkładamy prawie wszystko do bloku try, catch
		try {
			const res = await axios.post('/notes', note)
			const newNote = res.data
			notes.push(newNote)
			this.setState({ notes })
		} catch (err) {
			NotificationManager.error(err.response.data.message)
		}
	}

	async editNote(note) {
		await axios.put('/notes/' + note._id, note)

		const notes = [...this.state.notes]
		const index = notes.findIndex(x => x._id === note._id)
		if (index >= 0) {
			notes[index] = note
			this.setState({ notes })
		}
		this.toggleModal()
	}

	toggleModal() {
		this.setState({showEditModal: !this.state.showEditModal})
	}

	editNoteHandler(note) {
		this.toggleModal()
		this.setState( {editNote: note} )
	}

	render() {
		return (
			<div>
				<NotificationContainer />
				<p>Moje Notatki</p>

				<NewNote 
					onAdd={(note) => this.addNote(note)}
				/>
				<Modal
					isOpen={this.state.showEditModal}
					contentLabel="Edytuj notatkę">
					<EditNote
						title={this.state.editNote.title}
						body={this.state.editNote.body}
						_id={this.state.editNote._id}
						onEdit={note => this.editNote(note)}/>
						<button 
						onClick={() => this.toggleModal()}>Anuluj</button>
				
				</Modal>

				{this.state.notes.map(note => (
					<Note
						key={note._id}
						title={note.title}
						body={note.body}
						_id={note._id}
						onEdit={(note)=>this.editNoteHandler(note)}
						onDelete={_id => this.deleteNote(_id)}
					/>
				))}
			</div>
		)
	}
}

export default Notes
