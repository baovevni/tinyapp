# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly) but it just makes some ramdom string that is used to redirect to the correspomnding website. 

! In my app I covered scenarios when users are not logged in they have Login And Register buttons handy so they can do that right away without looking for the button. 
! Also I implemented Back button that redirtects to /urls/ page when error occured so users will not waste time refreshing the page or looking for the next steps. 
! When users are on Login page they can see Only Login form and Register button in case they are not registered yet. And Login button on Register page just in case they got to Register page by mistake. 

## Final Product

!["Screenshot of URLs page"](https://github.com/baovevni/tinyapp/blob/main/docs/urls-page.png)
!["Screenshot of error page for non-logged in users"](https://github.com/baovevni/tinyapp/blob/main/docs/Error-message-for-not-logged-in-user.png)
!["Screenshot of error page for logged in users"](https://github.com/baovevni/tinyapp/blob/main/docs/Error-for-logged-in-user.png)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.
