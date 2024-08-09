import React, { useState } from "react";
import "./BottomMenu.scss";
import { Link, Outlet } from "react-router-dom";
import { IoCompassOutline,IoCompass, IoHome, IoHomeOutline, IoNotifications, IoNotificationsCircleOutline, IoNotificationsOutline, IoPauseCircle, IoPersonOutline } from "react-icons/io5";

const BottomMenu = () => {
  const [activeRoute, setActiveRoute] = useState(window.localStorage.getItem('active-route') , 'home');

  const handleActiveRouteChange = (route) => {
    window.localStorage.setItem('active-route', route);
    setActiveRoute(route);
  }
  
  return (
    <div className="sm__root">
      <div className="sm__routes">
        <Outlet />
      </div>
      {/* <div className="sm__bottom-menu">
        <Link to={'home'} 
          onClick={() => handleActiveRouteChange('home')}>{activeRoute === 'home' ? <IoHome/> : <IoHomeOutline/>}</Link>
        <Link to={'discover'} 
          onClick={() => handleActiveRouteChange('discover')}>{activeRoute === 'discover' ? <IoCompass/> : <IoCompassOutline/>}</Link>
        <Link to={'notifications'}
          onClick={() => handleActiveRouteChange('notifications')}>{activeRoute === 'notifications' ? <IoNotifications/> : <IoNotificationsOutline/>}</Link>
        <Link to={'profile'} 
          onClick={() => handleActiveRouteChange('profile')}>{activeRoute === 'profile' ? <IoPerson/> : <IoPersonOutline/>}</Link>
      </div> */}
    </div>
  );
};

export default BottomMenu;
