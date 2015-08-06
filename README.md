# HTTP Network Monitor
A Node.js powered HTTP network monitor

-----
HTTP Network Monitor runs on Node.js. Make sure you have both [Node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) installed.

- The developers of this project use a [Raspberry Pi](https://www.raspberrypi.org/) as the network monitor. [Here](http://joshondesign.com/2013/10/23/noderpi) are Pi-specific instructions on installing Node.js and NPM.

<img src="https://cloud.githubusercontent.com/assets/4133076/9121156/5e74019c-3c35-11e5-9a45-9f9cf12763b7.png" />

### Setup
1. Install libraries:
    1. Update package lists: `sudo apt-get update`
    2. Install libpcap: `sudo apt-get install libpcap-dev`
    3. Install g++: `sudo apt-get install g++`
2. Clone repository: `git clone https://github.com/gregnr/http-network-monitor.git`
3. Navigate into directory: `cd http-network-monitor`
4. Initialize [node-http-parser](https://github.com/gregnr/node-http-parser) submodule: `git submodule update --init`
5. Install dependencies from package.json file: `npm install`
6. The dashboard website uses [Bower](http://bower.io/) for dependencies
    - Install bower globally: `sudo npm install -g bower`
    - Navigate to website directory: `cd static`
    - Install dependencies from bower.json file: `bower install`

### PostgreSQL: Initial setup
1. Install postgres: `sudo apt-get install postgresql postgresql-contrib`
2. Login as root user for postgres: `sudo -i -u postgres`
3. Create the "monitor" postgres user: `createuser -P -s -e monitor`, you will be prompted for a password
4. Create a new postgres db: `createdb monitor`
5. Open postgres: `psql`
6. Create a password for the postgres user: `\password postgres` (Allows for local connections to psql)
7. Quit postgres: `\q`
8. Return to regular user: `exit`
9. Allow local connections by editing the config file: `sudo vim /etc/postgresql/9.3/main/pg_hba.conf`
10. Change line `local all postgres peer` to `local all postgres md5`
11. Save and exit vim
12. Restart postgres: `sudo service postgresql restart`
13. Add the MessageExchange table and grant permissions to "monitor" user (using the SQL schema file):  `psql -d monitor -U postgres -W -a -f database_schema.sql`

### Running program
Since we will be reading network packets from the kernel, you need root access to run the monitor.

1. Run the monitor: `sudo node monitor.js` (captures packets)
2. Run the web server: `sudo node server.js` (serves admin dashboard)
3. Go to [http://localhost/](http://localhost/) in your browser to visit the admin dashboard

### Pulling new changes
1. Pull new changes: `git pull`
2. Update [node-http-parser](https://github.com/gregnr/node-http-parser) submodule to correct commit: `git submodule update`
3. Install any new dependencies from package.json file: `npm install`

### Virtualbox
Some people may want to test this app on a virtual machine. Use these instructions to set up an Ubuntu image on Virtualbox.

1. Download [Virtualbox](https://www.virtualbox.org/)
2. Download [an Ubuntu ISO](http://www.ubuntu.com/download/desktop)
3. To use in 64-bit, you may need to enable Intel Virtualization and Intel VT-d in your BIOS
4. Create a new VM in Virtualbox (~2GB memory, ~8GB dynamically allocated storage)
5. Window resize and copy-paste functionality requires requires the guest additions. Go to "Devices > Insert guest additions CD image" in the virtualbox window to install this package. Then restart the VM.

