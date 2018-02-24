# Reverse Coding Portal

### What Is Reverse Coding?
----------	
Reverse Coding, It is a coding event conducted by <b>[ACM VIT Student Chapter](http://acmvit.in)</b>, With Two Rounds,
Round 1 was conducted on <b>Codechef</b>.
Round 2 was conducted on <b>[rc.acmvit.in](http://rc.acmvit.in)</b>.

Round 1 was normal coding competition, Round 2 is where reverse coding comes into play,
In Round 2 Participants were given binary executable files using which they have to give some inputs and based on the output they get on the terminal they have to <b>guess the code</b> and submit the code file (eg: .py, .c , .java etc.) on [rc.acmvit.in](http://rc.acmvit.in) Developed By <b>[ACM VIT Student Chapter](http://acmvit.in)</b>.

### What is this repo about?
----------
[This repository](https://github.com/akshitgrover/Reverse_Coding_Portal) holds the backend part of the [Portal](http://rc.acmvit.in) developed by <b>[ACM VIT Student Chapter](http://acmvit.in)</b>.


### Backend Controllers:
----------
* Question Controller

> * Create Question (admin)	
> * Upload Code File (Participant)
> * Download Uploded Code Files (admin)
> * Get Question Code Files (Participant)
> * Get Question (Participant) (One Question Added After Every 3 Hours)

* Team Controller

> * Create Team
> * Login 
> * Logout
> * Get Team Details (Admin)
> * Get Team Score (Admin)
> * Put Score (admin)
> * Mark Team Answer (admin) (To Check If Any New Submissions)

### Packages Used:
----------
* [bcrypt-nodejs](https://www.npmjs.com/package/bcrypt-nodejs)
...Why? 
	* Hashing Passwords
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
...Why? 
	* Stateless Authentication
* [hacken](https://www.npmjs.com/package/hacken)
...Why?
	* Utility

### Docker Support:
----------
[Reverse Coding Portal](http://rc.acmvit.in) Was a big project to make sure everything wokrs fine when integrated with frontend and when taken into production, App was Dockerized.

<b>Dockerfile:</b><br>
Dockerfile is used to build the [image](https://hub.docker.com/r/akshitgrover/acmreversecoding_portal/) of this api.

<b>docker-compose.yml</b><br>
docker-compose.yml is used to deploy the stack (Sails API && MongoDb) in docker swarm when taken into production ([DigitalOcean Cloud](https://www.digitalocean.com/))

