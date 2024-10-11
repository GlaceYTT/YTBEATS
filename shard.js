const { ShardingManager } = require('discord.js');
require('dotenv').config();

// Initialize the Sharding Manager
const manager = new ShardingManager('./index.js', {
    token: process.env.TOKEN,
    totalShards: 'auto' // Automatically calculate the number of shards
});

// Event listener for when a shard is created
manager.on('shardCreate', shard => {
    console.log(`Successfully launched shard ${shard.id}`);
});

// Function to fetch total guild and member count from all shards using the cache
async function fetchTotalGuildsAndMembers() {
    const results = await manager.broadcastEval((client) => {
        const totalServers = client.guilds.cache.size;
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        return { totalServers, totalMembers };
    });

    // Sum results from all shards
    const totalServers = results.reduce((acc, shardData) => acc + shardData.totalServers, 0);
    const totalMembers = results.reduce((acc, shardData) => acc + shardData.totalMembers, 0);

    //console.log(`Total Servers: ${totalServers}, Total Members: ${totalMembers}`);

    // Send data to each shard via IPC (Inter-Process Communication)
    manager.shards.forEach(shard => {
        shard.send({ totalServers, totalMembers });
    });
}

// Spawn the shards and then fetch the guild/member data
manager.spawn().then(() => {
    fetchTotalGuildsAndMembers();
    setInterval(fetchTotalGuildsAndMembers, 60000); // Re-fetch every 1 minute
});



const express = require("express");
const app = express();
const port = 3000;
app.get('/', (req, res) => {
    const imagePath = path.join(__dirname, 'index.html');
    res.sendFile(imagePath);
});
app.listen(port, () => {
    console.log(`🔗 Listening to GlaceYT : http://localhost:${port}`);
});
