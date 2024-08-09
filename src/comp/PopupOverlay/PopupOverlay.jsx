import React from "react";
import "./PopupOverlay.scss";
import { IoClose } from "react-icons/io5";

const PopupOverlay = React.forwardRef((props, ref) => {

    const handleClose = () => {
        ref.ref.current.classList.remove('overlay-visible');
    }

  return (
    <div className="popup-overlay" {...ref ? ref={ref} : null}>
      {props.isLoading ? 
      <div className="loader-spinner"></div>
      :
      <div className="popup">
        <button className="close-btn" onClick={handleClose}>
          <IoClose />
        </button>
        <div className="popup-content">
          <h3 className="popup-title">{props.popupTitle}</h3>
          {props.popupTexts.map((txt, index) => {
            return <p key={index} className="popup-txt">{txt}</p>
          })}
        </div>
      </div>}
    </div>
  );
});

export default PopupOverlay;
