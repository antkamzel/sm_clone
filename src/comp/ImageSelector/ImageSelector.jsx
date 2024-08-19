import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import PopupOverlay from "../../comp/PopupOverlay/PopupOverlay";

import "./ImageSelector.scss";
import { IoAdd, IoFileTray, IoFileTrayStacked } from "react-icons/io5";
import { LuImagePlus } from "react-icons/lu";

const ImageSelector = ({ setImages, limit, defaultImg }) => {
  let timeout;
  const timeoutDuration = 150;

  const [selectedImages, setSelectedImages] = useState([]);

  const fileInputRef = useRef(null);
  const tooManyFilesPopupRef = useRef(null);
  const reorderList = useRef(null);
  const paginationRefs = useRef([]);

  // ---------functions
  const handleFileInputChange = (event) => {
    const files = Array.from(event.target.files); // Convert FileList to array

    files.sort((a, b) => a.name.localeCompare(b.name));

    if (files.length > limit) {
      tooManyFilesPopupRef.current.classList.add("overlay-visible");
      return;
    }


    changeAspectRatio(files);

    setSelectedImages(files);
    setImages(files);
  };

  const handleSlideChange = (ev) => {
    try {
      document.querySelectorAll(".pagination-active").forEach((el) => {
        el.classList.remove("pagination-active");
      });
      document
        .querySelector(`.pagination-item[orderindex="${ev.activeIndex}"]`)
        .classList.add("pagination-active");
    } catch (err) {}
  };

  const dragStartEvent = (ev, index) => {
    timeout = setTimeout(() => {
      ev.target.classList.add("dragging");
    }, timeoutDuration);
  };

  const dragEndEvent = (ev, index) => {
    clearTimeout(timeout);
  };

  const changeAspectRatio = (filesarray) => {
    // Create a new FileReader to read the first image file
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        // console.log(`Aspect Ratio of the first image: ${aspectRatio}`);

        // Get the container width (assuming full width)
        const container = document.querySelector(".choose-image-wrapper");
        if (container) {
          const containerWidth = container.clientWidth; // Full width of the container
          const containerHeight = containerWidth / aspectRatio;

          // Set the container's height
          container.style.height = `${containerHeight}px`;
        }
      };
      img.src = e.target.result;
    };

    // Read the first file as a data URL
    if (filesarray.length > 0) {
      reader.readAsDataURL(filesarray[0]);
    }
  };

  const reorderItems = (ev) => {
    let touch;
    try {
      touch = ev.changedTouches[0];
    } catch (err) {}
    timeout = setTimeout(() => {
      const draggingItem = reorderList.current.querySelector(".dragging");
      const draggingIndex = draggingItem.getAttribute("orderindex");
      let elementBelowTouch;
      // if the device has touch (mobile)
      if (touch) {
        elementBelowTouch = document.elementFromPoint(
          touch.clientX,
          touch.clientY
        );
      } else {
        elementBelowTouch = document.elementFromPoint(ev.clientX, ev.clientY);
      }
      const targetIndex = elementBelowTouch.getAttribute("orderindex");

      draggingItem.classList.remove("dragging");
      if (targetIndex === draggingIndex) return;
      const newImages = [...selectedImages];
      const [draggedItem] = newImages.splice(draggingIndex, 1);
      newImages.splice(targetIndex, 0, draggedItem);
      // setting images for the image selector
      setSelectedImages(newImages);
      // returning new images to parent page
      setImages(newImages);
      changeAspectRatio(newImages);
    }, timeoutDuration);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Click the hidden file input when custom button is clicked
  };

  useEffect(() => {
    // console.log(defaultImg);
    if(defaultImg){
      setSelectedImages([defaultImg]);
    }
  }, [])

  useEffect(() => {
    try {
      document
        .querySelector('.pagination-item[orderindex="0"]')
        .classList.add("pagination-active");
    } catch (err) {}
  }, [selectedImages]);

  return (
    <div className="image-selector-comp">
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileInputChange}
      />
      <div className="choose-image-wrapper">
        {selectedImages.length < 1 ? (
          <button className="select-image-btn btn" onClick={handleButtonClick}>
            {" "}
            <LuImagePlus />{" "}
          </button>
        ) : null}
        {selectedImages.length > 0 && (
          <div className="swiper-container">
            <button
              className="select-image-btn btn"
              onClick={handleButtonClick}
            >
              {" "}
              <LuImagePlus />{" "}
            </button>
            <Swiper
              slidesPerView={1}
              onSlideChange={handleSlideChange}
              loop={false}
              className="swiper-comp"
            >
              {selectedImages.map((image, index) => (
                <SwiperSlide key={index} orderindex={index}>
                  <img
                    key={index}
                    src={typeof(image) !== 'string' ?  URL.createObjectURL(image) : image}
                    alt={"image slide number " + index}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
      {selectedImages.length > 1 ? (
        <div
          className="wrapper-flex reordering-list"
          ref={reorderList}
          onDragEnd={reorderItems}
          onTouchEnd={reorderItems}
        >
          {selectedImages.map((img, index) => {
            return (
              <img
                onDragStart={(ev) => dragStartEvent(ev, index)}
                onTouchStart={(ev) => dragStartEvent(ev, index)}
                onDragEnd={(ev) => dragEndEvent(ev, index)}
                onTouchEnd={(ev) => dragEndEvent(ev, index)}
                ref={(el) => (paginationRefs.current[index] = el)}
                draggable={true}
                key={index}
                orderindex={index}
                className="pagination-item reorder-list-item"
                src={URL.createObjectURL(img)}
                alt="ekala"
              />
            );
          })}
        </div>
      ) : null}
      <PopupOverlay
        ref={tooManyFilesPopupRef}
        popupTitle="Too many files selected"
        popupTexts={[
          `Please go back and select a maximum of ${limit} ${
            limit === 1 ? "image" : "images"
          }`,
        ]}
      />
    </div>
  );
};

export default ImageSelector;
