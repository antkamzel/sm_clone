import React, { useEffect, useRef } from 'react';
import './NewPostBtn.scss';
import { useNavigate } from 'react-router-dom';

const NewPostBtn = (props) => {

  let prevScrollY = 0;

  const nav = useNavigate();

  // refs
  const btn = useRef();


  const handleClick = () => {
    btn.current.classList.toggle('open');
  };
  const goTo = (ev) => {
    ev.stopPropagation();
    nav('/new-post');
  }

  const handleScroll = () => {
    if(window.scrollY > 200){
      if(window.scrollY > prevScrollY){
        prevScrollY = window.scrollY;
        btn.current.style.opacity = '0';
        return;
      }
      prevScrollY = window.scrollY;
    }
    btn.current.style.opacity = '1';
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    }
  }, [])
  

  return (
    <div className='new-post-btn'>
      <button className='primary' ref={btn} onClick={handleClick}>
        <p tabIndex={0} onClick={(ev) => goTo(ev)}>Create a new post</p>
        {props.icon}
      </button>
    </div>
  );
};

export default NewPostBtn;
