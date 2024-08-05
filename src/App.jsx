
import React, { useState,useRef } from 'react';
import axios from 'axios';
import './App.css'
import { IoCloseOutline } from "react-icons/io5";
import { FaCopy } from "react-icons/fa";
import Spinner from './components/Spinner';
import { ToastContainer, toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import 'react-toastify/dist/ReactToastify.css';


const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function PostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading,setIsLoading]=useState(false)
  const [image, setImage] = useState(null);
  const [ogImageUrl, setOgImageUrl] = useState('');

  const inputRef=useRef(null)


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await blobToBase64(file);
      setImage(base64);
    }
    e.target.value = '';
  };

  const handleClose=()=>{
    setImage(null)
  }

  const handleCloseOg=()=>{
    setTitle('')
    setContent('')
    setImage(null)
    setOgImageUrl('')
  }

  const onClickCopy=()=>{
   
      if (navigator.clipboard) {
        navigator.clipboard.writeText(ogImageUrl);
        toast('Url copied to Clipboard',{
          style: {
            color: '#213547',
          },
          progressStyle: {
            background: '#213547', 
          },
        });
      } else {
        toast.error('Cannot be Copied');
      }
    }

 
  const generateOgImage = async () => {
    if(title.trim()===''||content.trim()===''){
      toast.error('Title & Content should not be empty')
      return
    }
    try {
      setIsLoading(true)
      const response = await axios.post('http://localhost:3000/generate-og-image', { title, content, image }, {
        responseType: 'arraybuffer', 
      });

      const blob = new Blob([response.data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);
      setOgImageUrl(url);
      setImage(null)
    } catch (error) {
      console.error('Error generating OG image:', error);
    }finally{
      setIsLoading(false)
    }
  };

  return (
    <div className='container'>   
    <div className="post-page">
      <h1>Create a Post</h1>
      <input 
        type="text" 
        placeholder="Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
      />
      <textarea 
        placeholder="Content" 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
      />
      <input 
        type="file" 
        onChange={handleImageUpload} 
        className='file'
        ref={inputRef}
      />
      <div className='d-flex'>
      <div className='upload-container'><button className='upload-btn' onClick={()=>{inputRef.current?.click()}}>upload file</button></div>
      {ogImageUrl && <button onClick={handleCloseOg} className='clear-button'>Clear</button>}
      </div>

     {(!ogImageUrl && image) && <div className="post-preview">
      <div className='close-prt'>
        <div className='close-btn' onClick={handleClose}><IoCloseOutline className='close-icon'/></div>
        <img src={image} alt="Post" />
        </div>
      </div>}
      {ogImageUrl && (
        <div  className="generated-og-image">
         
          <div className='text-copy-container'> <h3>Generated OG Image</h3><FaCopy className='copy-icon' onClick={onClickCopy}/></div>
          <Helmet>
          <meta property="og:image" content={ogImageUrl} />
          </Helmet>
          <img src={ogImageUrl} alt="OG" />
          
        </div>
      )}
      {!ogImageUrl&&<div className='spin-button-container'><button onClick={generateOgImage} className='button'>{!isLoading?'Generate OG Image':<Spinner/>}</button></div>
      }

    </div>
    <ToastContainer />
    </div>
 
  );
}

export default PostPage;
