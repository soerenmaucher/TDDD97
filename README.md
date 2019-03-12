# Twidder (TDDD97) Linköping University 2019

This Project is a simple social media website called Twidder that was created for the TDDD97 Web Programming course at the Linköping University. 
Different users can be created with a profile page including profile picture/video. Logged in users can search for other users by email and see their profile page and post messages on their wall.
The application is done as a single page application and sessions are handled via tokens. However, once the user logs in from a second client the first session is terminated. For this, a two-way communication using WebSockets is implemented. 
Only hashed passwords are stored in the database and the access tokens for the POST requests are hashed as well using arbitrary data from the requests. 

