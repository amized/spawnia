// Channel class represents a room of connections, and handles
// updating, loading, saving and broadcasting of the live data
// to it's connections. 

"use strict";

//var actions     = require("./actions/actions");
var events      = require('events');
var _           = require("underscore");



var status = {
    UNLOADED: 0,
    LOADED: 1
}

var Channel = class {

    constructor(gameId) {

        this.store       = null;
        this.connections = {};

        this.id          = gameId;

        this.saving      = false;
        this.saveTimer   = false;

        this.status      = status.UNLOADED;

        this.ee          = new events.EventEmitter();
    }

    getConnection(conn) {
        if (this.connections[conn.id] !== undefined) {
            return this.connections[conn.id];
        }
        return null;
    }

    getUser(conn) {
        if (this.connections[conn.id] !== undefined &&
            this.connections[conn.id].user !== null) {
            return this.connections[conn.id].user;
        }
        return null;       
    }

    getState() {
        if (this.store !== null) {
            return this.store.getState();
        }
        else {
            return null;
        }
    }

    requestConnection(conn, user) {
        this.addConnection(conn, user);
        /*
        if (this.status === status.UNLOADED) {
            this.ee.once("STORE_INIT", function () {
                this.addConnection(conn, user);
            }.bind(this));
        }
        else {
            this.addConnection(conn, user);
        }
        */
    }

    addConnection(conn, user) {
        // If django told us that this connection is associated
        // with a ticketed user OR if they are an admin
        /*
        if (user !== null && (user.seatNumber !== -1 || user.status === 'admin')) {
            var action = actions.userIsOnline(user);
            this.applyUpdate(action);
        }
        */

        // Add the new connection 
        this.connections[conn.id] = {
            conn: conn,
            user: user
        }

        // Injects the total connection count intot he store
        //var action = actions.updateConnections(this.getNumberUniqueConns());
        //this.applyUpdate(action);

        // Dump data to the client
        /*
        var state = this.store.getState();
        var obj = {
            dump: true,
            data: {
                users: state.users,
                chat: state.chat,
                me: user,
                livebites: state.livebites
            }
        }
        */
        conn.write(JSON.stringify("some daya"));
    }

    getNumberUniqueConns () {
        var uniqueUserIds = [];
        // Filter out connections with duplicate users
        var filtered = _.filter(this.connections, function (connection) {
            if (connection.user) {
                // Found a duplicate user
                if (uniqueUserIds.indexOf(connection.user.id) !== -1) {
                    return false;
                }
                else {
                    uniqueUserIds.push(connection.user.id)
                    return true;
                }
            }
            else {
                return true;
            }
        });
        return filtered.length;
    }

    unsubscribe(conn) {
        var connection = this.connections[conn.id];
        if (connection) {
            // If this connection is a ticketed user, we will need to notify
            // everyone that they've gone offline
            if (connection.user !== null) {
                if (connection.user.seatNumber !== -1 || connection.user.status === 'admin') {
                    var action = actions.userIsOffline(connection.user);
                    this.applyUpdate(action);
                }
            }
            delete this.connections[conn.id];
            var action = actions.updateConnections(this.getNumberUniqueConns());
            this.applyUpdate(action);
        }
    }

    applyUpdate (action) {
        // Dispatch action to server
        this.store.dispatch(action);
        // Start the save strategy to persist the store
        this.startSaveStrategy();
        // Assign order ID
        var orderId = 5;
        // Broadcast action to all clients
        for (var id in this.connections) {
            var data = {
                action: action,
                order: orderId
            }
            this.connections[id].conn.write(JSON.stringify(data));
        }
    }

    startSaveStrategy() {
        /*
        if (this.saveTimer === false) {
            this.saveTimer = setTimeout(function () {
                this.saveTimer = false;
                this.save();
            }.bind(this), settings.channelSaveInterval);
        }
        */
    }
}

// Class that handles retreiving and saving store data to disk
/*
var ChannelPersist = class {

    constructor(channelId) {
        this.id = channelId;
        this.versions = [];
        this.indexPath = settings.channelSavePath + "/channel_index_" + this.id + ".json";
        this.maxVersions = settings.maxStoreVersions;
    }

    getStoragePath(timestamp) {
        return settings.channelSavePath + "/channel_" + this.id + "_" + timestamp + ".json";
    }

    // Saves the data store to disk
    save(store) {
        if (this.store === null) {
            return;
        }

        var self = this;

        // Store data
        var data = store.getState();
        
        var timestamp = new Date().getTime();
        var filename = this.getStoragePath(timestamp);

        // Write out the store data
        var p = new Promise(function(resolve, reject) {
            fs.writeFile( filename, JSON.stringify(data), "utf8", function(err) {
                if (err) {
                    console.log("Error saving " + filename);
                    reject(err);
                }
                resolve();
            });
        });

        // Update the index file
        p.then(function () {
            self.versions.push(filename);
            // Clean up
            if (self.versions.length > self.maxVersions) {
                var bottomIndex = Math.floor(self.maxVersions/2);
                for (var i = 0; i < bottomIndex; i++) {
                    try {
                        fs.unlinkSync(self.versions[i]);
                    }
                    catch (err) {
                        console.log("Error deleting file ", err.message);
                    }
                }
                self.versions.splice(0, bottomIndex);
            }

            return new Promise(function(resolve, reject) {
                fs.writeFile( self.indexPath, JSON.stringify({
                    current: filename,
                    versions: self.versions
                }), "utf8", function(err) {
                    if (err) {
                        reject(err);
                    }
                    console.log("Channel index" + self.id + " has been saved.");
                    resolve();
                });
            })
        }).catch(function (err) {
            console.log("Could not save channel.");
            console.log(err.message);
        });
        
    }


    // Loads the channel data from a json file into the store,
    // or if there's no json just create an empty
    load() {
        var self = this;
        // Get pointer to current version
        var p = new Promise(function(resolve, reject) {
            fs.lstat(self.indexPath, function(err, stats) {
                if (err) {
                    if (err.code === 'ENOENT') {
                        // The channel has been opened for the first time here.
                        resolve(null);
                        return;
                    }
                    else {
                        console.log("ERROR READING FILE SYSTEM, CANNOT LOAD CHANNEL");
                        reject();
                    }
                }
                else {
                    // We load a json file that contains information
                    // about which file is the current version
                    try {
                        var index = require(self.indexPath);
                    }
                    catch (err) {
                        console.log("Could not read file", self.indexPath);
                        reject();
                    }
                    
                    self.versions = index.versions;
                    resolve(index.current);
                }
                
            });
        }); 



        return p.then(function (currVersionPath) {

            if (currVersionPath === null) {
                return new Promise(function(resolve, reject) {
                    resolve(createStore(playfiApp));
                }); 
            }
            else {
                return new Promise(function(resolve, reject) {
                    fs.lstat(currVersionPath, function(err, stats) {
                        if (err) {
                            console.log("ERROR READING FILE SYSTEM, CANNOT LOAD CHANNEL");
                            reject();
                        }
                        else {
                            var data = require(currVersionPath);
                            resolve(createStore(playfiApp, data));
                        }
                        
                    });
                });
            }
        });
    }
}
*/


module.exports = Channel;