import React, { useContext, useState } from 'react'
import { BiImageAdd } from 'react-icons/bi'
import { GeneralContext } from '../../context/GeneralContextProvider'
import {v4 as uuid} from 'uuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../firebase';

const Input = () => {

    const {socket, chatData} = useContext(GeneralContext);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState();
    const userId = localStorage.getItem('userId');
    const handleSend = async () => {
      console.log('Current chatId:', chatData.chatId);

      console.log('Handle Send Triggered'); // Debugging log
    
      if (file) {
        console.log('File is present, starting upload...'); // Debugging log
    
        const storageRef = ref(storage, uuid());
        const uploadTask = uploadBytesResumable(storageRef, file);
    
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
            console.log(`Upload is ${progress}% done`); // Debugging log
          }, 
          (error) => {
            console.error('Error uploading file:', error);
          }, 
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('File available at', downloadURL);
    
              const messageData = {
                chatId: chatData.chatId,
                id: uuid(),
                text: text,
                file: downloadURL,
                senderId: userId,
                date: new Date()
              };
    
              console.log('Emitting new message:', messageData); // Debugging log
              await socket.emit('new-message', messageData);
              setUploadProgress(0); // Reset upload progress
              setText('');
              setFile(null);
            } catch (err) {
              console.error('Error sending message:', err);
            }
          }
        );
      } else {
        const messageData = {
          chatId: chatData.chatId,
          id: uuid(),
          text: text,
          file: '',
          senderId: userId,
          date: new Date()
        };
    
        try {
          console.log('Emitting new message text:', messageData); // Debugging log
          await socket.emit('new-message', messageData);
          setText('');
        } catch (err) {
          console.error('Error sending message:', err);
        }
      }
    }
    
    
  return (
    <div className='input' >
      <input type="text" placeholder='type something...' onChange={e => setText(e.target.value)} value={text} />
      <div className="send">
        <input type="file" style={{display : 'none'}} id='file' onChange={e=> setFile(e.target.files[0])} />
        <label htmlFor="file" style={{display:'flex'}}>
          <BiImageAdd />
          <p style={{fontSize: '12px'}}>{uploadProgress ? Math.floor(uploadProgress) + '%' : ''}</p>
        </label>
        <button onClick={handleSend} >Send</button>
      </div>
    </div>
  )
}

export default Input