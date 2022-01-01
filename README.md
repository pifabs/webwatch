# WebWatch
Monitor websites without leaving discord

### **[Add webwatch to your server](https://discord.com/oauth2/authorize?client_id=918333040797835365&permissions=277025572864&scope=bot%20applications.commands)**

### Commands
##### Prefix: w!

`w!help` List all valid commands.

##### Monitor management:
`w!add-site <site1 site2 ...>` Add websites to monitor.

`w!ls-sites` List sites you've added.

`w!rm-site <idx>` Remove monitor by index. Use the index outputted by `ww!ls-sites`.

##### Scheduled job:
`w!sched-job <valid cron expression>` Tell webwatch when and how often to check your websites.

`w!enable-job <1|0>` Enable/disable scheduled job.

`w!rm-job` Terminate and delete scheduled job.

##### Alerts
`w!set-email <valid email>` Set an email to receive notification

`w!enable-alert <1|0>` Enable/disable alerts.

##### Status and Reports:
`w!check-status` Manually trigger the checking. This will list all your website and their status.

`w!stats <idx1, idx2 ...>` This will display the latest uptime rate and response time including the moving average for the last 30 minutes, 24 hours and 30 days. Use the index outputted by `ww!ls-sites`.

`w!show-charts <idx>` Display uptime and response time chart for the last 24 hours. Use the index outputted by `ww!ls-sites`.
