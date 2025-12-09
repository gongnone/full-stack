WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.060 --> 00:00:00.460
All right,

00:00:00.540 --> 00:00:03.820
so in this next section we're going to go go quite

00:00:03.820 --> 00:00:05.500
a bit deeper into durable objects.

00:00:05.500 --> 00:00:07.500
And we're going to be utilizing the Durable Object

00:00:07.500 --> 00:00:09.420
SQL API and WebSockets.

00:00:09.740 --> 00:00:11.980
The exact implementation that we're going to be

00:00:11.980 --> 00:00:14.060
building out is essentially this mapping feature.

00:00:14.060 --> 00:00:15.820
So you can see that you have a map of the world.

00:00:15.820 --> 00:00:18.380
You can kind of like break it down into regions as

00:00:18.380 --> 00:00:18.700
well.

00:00:18.940 --> 00:00:19.740
I wouldn't like,

00:00:19.740 --> 00:00:21.420
worry too much about the UI side of it.

00:00:21.420 --> 00:00:21.660
I,

00:00:21.660 --> 00:00:23.460
what I want to illustrate is how you would

00:00:23.460 --> 00:00:24.500
implement this on the back end.

00:00:24.500 --> 00:00:26.260
And essentially what's going to be happening is

00:00:26.260 --> 00:00:28.600
whenever a user around the world click clicks on a

00:00:28.600 --> 00:00:29.800
link in real time,

00:00:29.800 --> 00:00:31.000
right when they click that link,

00:00:31.080 --> 00:00:32.920
that you should be able to see that event,

00:00:33.110 --> 00:00:36.020
or that user as a little dot as to wherever they

00:00:36.020 --> 00:00:36.700
are in the world.

00:00:36.810 --> 00:00:38.120
I think it's a pretty cool use case.

00:00:38.120 --> 00:00:38.920
You could imagine

00:00:39.240 --> 00:00:41.520
building out a really sophisticated analytics

00:00:41.520 --> 00:00:41.720
tool.

00:00:41.720 --> 00:00:42.240
We're able,

00:00:42.240 --> 00:00:44.080
where you're able to track users that are clicking

00:00:44.080 --> 00:00:44.550
on links,

00:00:45.130 --> 00:00:45.850
on like a,

00:00:45.850 --> 00:00:46.210
you know,

00:00:46.210 --> 00:00:47.210
on a globe and stuff.

00:00:47.210 --> 00:00:48.570
But the actual like,

00:00:48.570 --> 00:00:49.770
UI of this is going to be very,

00:00:49.770 --> 00:00:50.330
very simple.

00:00:50.330 --> 00:00:52.010
We're going to go pretty deep on the back end

00:00:52.010 --> 00:00:52.410
though.

00:00:52.410 --> 00:00:52.810
Now,

00:00:52.890 --> 00:00:53.930
if you are

00:00:54.570 --> 00:00:55.850
a more experienced developer

00:00:56.170 --> 00:00:58.090
throughout like this implementation,

00:00:58.090 --> 00:01:00.290
what you're going to be thinking probably is like,

00:01:00.290 --> 00:01:00.530
wow,

00:01:00.530 --> 00:01:02.570
this is way overkill for what we're doing.

00:01:02.650 --> 00:01:04.410
And I would agree the,

00:01:04.410 --> 00:01:06.330
the core purpose of this section is actually to

00:01:06.330 --> 00:01:08.930
kind of like showcase how you would use the SQL

00:01:08.930 --> 00:01:11.970
API and also how you can use The Durable Objects

00:01:11.970 --> 00:01:14.650
WebSocket API in conjunction or separately.

00:01:15.400 --> 00:01:15.800
so like,

00:01:15.800 --> 00:01:17.240
I think this is like a really good,

00:01:17.700 --> 00:01:20.380
overview and implementation on how to build on top

00:01:20.380 --> 00:01:20.700
of it.

00:01:20.700 --> 00:01:22.940
But there are simpler ways to accomplish what

00:01:22.940 --> 00:01:23.620
we're accomplishing.

00:01:23.620 --> 00:01:24.820
One of those would just be like

00:01:25.180 --> 00:01:26.060
pulling your database,

00:01:26.060 --> 00:01:26.380
you know,

00:01:26.380 --> 00:01:28.180
every second to see if you got any new link

00:01:28.180 --> 00:01:28.460
clicks.

00:01:28.460 --> 00:01:30.420
I think that would be the better solution if you

00:01:30.420 --> 00:01:31.820
were to actually like roll this out.

00:01:31.820 --> 00:01:34.220
But WebSockets are really cool and there's a lot

00:01:34.220 --> 00:01:35.380
of use cases for them.

00:01:35.380 --> 00:01:37.220
So I do think that this is going to be some,

00:01:37.220 --> 00:01:38.940
a section where you're going to learn a lot.

00:01:39.020 --> 00:01:39.267
Now

00:01:39.267 --> 00:01:41.521
let's head over to our system system diagram to

00:01:41.521 --> 00:01:42.761
kind of see where this fits.

00:01:42.841 --> 00:01:45.561
So over here we have our ui and then this is our

00:01:45.561 --> 00:01:46.281
backend service.

00:01:46.281 --> 00:01:48.681
And our backend service like interfaces with a

00:01:48.681 --> 00:01:51.041
queue and it interfaces with our durable object

00:01:51.041 --> 00:01:51.401
for,

00:01:52.951 --> 00:01:54.431
for scheduling out our workflows.

00:01:54.431 --> 00:01:55.431
And then we have a workflow,

00:01:55.431 --> 00:01:55.751
right,

00:01:55.831 --> 00:01:58.311
and this is a user that clicks on a link and

00:01:58.871 --> 00:02:01.271
basically gets redirected to the correct

00:02:01.271 --> 00:02:01.751
destination.

00:02:02.471 --> 00:02:02.871
Now

00:02:02.991 --> 00:02:05.371
in the background we are sticking that data onto a

00:02:05.371 --> 00:02:05.592
queue.

00:02:05.592 --> 00:02:08.636
What we're also going to do is we are going to be

00:02:09.116 --> 00:02:10.876
sticking a durable object

00:02:11.436 --> 00:02:14.756
that is essentially a unique instance of a durable

00:02:14.756 --> 00:02:15.196
object

00:02:15.486 --> 00:02:16.526
at the account level.

00:02:16.686 --> 00:02:17.086
So

00:02:17.306 --> 00:02:19.406
you can imagine user has an account and anybody

00:02:19.406 --> 00:02:21.246
under that account would be able to unlock this

00:02:21.246 --> 00:02:22.326
feature where they see

00:02:22.786 --> 00:02:24.966
people click on links in real time on a map.

00:02:24.966 --> 00:02:26.006
Now when,

00:02:26.166 --> 00:02:26.566
when

00:02:26.766 --> 00:02:29.626
the Hono API is essentially proxy proxying that

00:02:29.626 --> 00:02:31.266
request or redirecting them back,

00:02:31.366 --> 00:02:32.846
they're going to write onto a queue and then

00:02:32.846 --> 00:02:33.606
immediately after

00:02:34.006 --> 00:02:35.686
they're also going to send some

00:02:35.866 --> 00:02:38.606
link click data to a durable object similar to

00:02:38.606 --> 00:02:39.246
what we're doing here.

00:02:39.246 --> 00:02:41.886
But we're going to bypass this queue step

00:02:41.886 --> 00:02:43.886
altogether just because it doesn't like

00:02:44.206 --> 00:02:45.486
there is going to be you

00:02:45.786 --> 00:02:48.186
few seconds delay from like when anything goes on

00:02:48.186 --> 00:02:49.426
to a queue to when it's consumed.

00:02:49.426 --> 00:02:50.986
And we want to try to make this a little bit more

00:02:50.986 --> 00:02:51.546
real time.

00:02:52.106 --> 00:02:54.826
Now from there the user will be able to use web,

00:02:54.826 --> 00:02:56.346
utilize websockets to

00:02:56.746 --> 00:02:58.906
see those changes in real time.

00:02:59.146 --> 00:03:02.066
Now every single time a link is clicked and it's

00:03:02.066 --> 00:03:03.306
stuck into a durable object,

00:03:03.386 --> 00:03:06.426
the durable Object has a SQLite back database

00:03:06.426 --> 00:03:08.426
attached with that specific instance.

00:03:08.506 --> 00:03:10.386
So we're also going to keep track of like the last

00:03:10.386 --> 00:03:11.706
100 link clicks

00:03:12.026 --> 00:03:12.426
and

00:03:12.966 --> 00:03:15.336
to kind of illustrate what that would look like.

00:03:15.336 --> 00:03:16.216
So you can imagine

00:03:16.616 --> 00:03:19.016
our backend service sends a link click to our

00:03:19.016 --> 00:03:19.976
durable object.

00:03:20.296 --> 00:03:22.336
Now our durable object would basically take this

00:03:22.336 --> 00:03:25.016
link click and then just imagine this as a table

00:03:25.016 --> 00:03:27.696
and this table has link ID account id,

00:03:27.696 --> 00:03:28.176
latitude,

00:03:28.176 --> 00:03:28.976
longitude and country.

00:03:28.976 --> 00:03:29.336
Right?

00:03:29.736 --> 00:03:31.256
Now when we get a link click,

00:03:31.376 --> 00:03:33.496
the durable object is going to back up that link

00:03:33.496 --> 00:03:35.439
click by inserting the data into a table.

00:03:35.439 --> 00:03:38.044
And then it is also going to send that data down

00:03:38.624 --> 00:03:40.064
to the UI via a websocket.

00:03:40.064 --> 00:03:41.104
It's going to push that information

00:03:41.584 --> 00:03:42.544
down right away.

00:03:43.104 --> 00:03:44.984
Now if there's multiple users,

00:03:44.984 --> 00:03:47.544
so imagine another user spins up this application

00:03:47.544 --> 00:03:49.418
essentially when they load this for the first time

00:03:49.578 --> 00:03:51.818
we should be able to say like hey,

00:03:52.058 --> 00:03:52.778
I'm online.

00:03:53.257 --> 00:03:56.058
The durable object recognizes a new user is online

00:03:56.218 --> 00:03:58.018
and then the durable object says okay,

00:03:58.018 --> 00:03:59.658
well what I'm going to do is I'm going to show

00:03:59.978 --> 00:04:00.618
the last

00:04:00.938 --> 00:04:03.498
50 link clicks or the last link clicks in the last

00:04:03.498 --> 00:04:05.498
hour or something and it's going to send all this

00:04:05.498 --> 00:04:06.138
data down

00:04:06.847 --> 00:04:07.258
via one

00:04:07.427 --> 00:04:09.747
WebSocket request right on startup

00:04:10.147 --> 00:04:11.187
to this user.

00:04:11.347 --> 00:04:11.747
Then

00:04:11.961 --> 00:04:14.961
that user's map will be populated and then every

00:04:14.961 --> 00:04:16.761
subsequent click that happens,

00:04:16.761 --> 00:04:18.201
it'll go into a durable object.

00:04:18.201 --> 00:04:20.681
The durable object will back it up and then it

00:04:20.681 --> 00:04:23.521
will cascade that request to all the clients.

00:04:23.521 --> 00:04:24.441
So it will send,

00:04:24.441 --> 00:04:26.441
basically it will send that link click information

00:04:26.441 --> 00:04:28.881
to this client and also this client at the exact

00:04:28.881 --> 00:04:29.201
same time.

00:04:29.201 --> 00:04:30.921
And if there's more than two clients,

00:04:31.081 --> 00:04:32.601
this could probably scale to

00:04:33.001 --> 00:04:35.081
I would say several hundred clients would most

00:04:35.081 --> 00:04:35.721
likely be

00:04:35.732 --> 00:04:37.562
but what this could scale to or probably more than

00:04:37.562 --> 00:04:38.322
that honestly.

00:04:38.402 --> 00:04:38.802
So

00:04:38.972 --> 00:04:41.332
I hope this kind of makes sense from like a really

00:04:41.412 --> 00:04:42.732
high level perspective.

00:04:42.732 --> 00:04:43.892
There's two things at play.

00:04:43.892 --> 00:04:44.692
There is a,

00:04:45.142 --> 00:04:47.592
there's a SQLite table that's keeping track of

00:04:47.592 --> 00:04:48.192
like the last

00:04:48.752 --> 00:04:50.312
n number of link clicks.

00:04:50.312 --> 00:04:50.992
That could be a hundred,

00:04:50.992 --> 00:04:51.792
it could be a thousand.

00:04:51.871 --> 00:04:54.552
It's not super important but essentially the

00:04:54.552 --> 00:04:56.592
durable object is going to have a few concepts of

00:04:56.592 --> 00:04:56.912
state.

00:04:56.912 --> 00:04:58.912
It'll have this table with this data,

00:04:59.072 --> 00:05:00.432
but it will also have,

00:05:00.912 --> 00:05:02.192
it'll keep track of

00:05:02.832 --> 00:05:04.303
the most recent link click

00:05:04.303 --> 00:05:04.681
and

00:05:05.081 --> 00:05:07.031
the oldest link click that way.

00:05:07.191 --> 00:05:10.031
Essentially what we could do is like when we're

00:05:10.031 --> 00:05:11.871
trying to clean up this table as it grows too

00:05:11.871 --> 00:05:12.071
large,

00:05:12.071 --> 00:05:13.431
when we delete records,

00:05:13.831 --> 00:05:15.671
it will be able to kind of say like okay,

00:05:15.671 --> 00:05:16.791
these guys got deleted.

00:05:17.111 --> 00:05:19.591
This is the oldest and this is the

00:05:19.811 --> 00:05:21.671
most recent and these will be called offsets.

00:05:21.671 --> 00:05:23.671
So it's going to keep track of these offsets as

00:05:23.671 --> 00:05:23.951
well.

00:05:24.491 --> 00:05:26.771
just to kind of like be able to manage the table

00:05:26.771 --> 00:05:27.131
data

00:05:27.761 --> 00:05:28.281
while the,

00:05:28.281 --> 00:05:30.641
while the durable object is also like doing other

00:05:30.641 --> 00:05:30.961
things.

00:05:30.961 --> 00:05:32.801
So there's going to be a few concepts of state.

00:05:32.801 --> 00:05:33.761
So you're going to have the

00:05:34.561 --> 00:05:34.591
most

00:05:34.741 --> 00:05:35.621
recent offset

00:05:35.941 --> 00:05:37.141
and the most recent offset,

00:05:37.141 --> 00:05:37.981
the oldest offset.

00:05:37.981 --> 00:05:40.141
You're going to have the actual like RAW table in

00:05:40.141 --> 00:05:40.501
the

00:05:40.691 --> 00:05:41.581
SQLite table.

00:05:41.581 --> 00:05:44.301
And then you're also going to have users

00:05:44.301 --> 00:05:45.781
essentially you're going to have like live

00:05:45.781 --> 00:05:46.701
sessions or

00:05:47.371 --> 00:05:50.331
live clients that are currently connected via

00:05:50.331 --> 00:05:51.971
websocket to a durable object.

00:05:51.971 --> 00:05:52.811
And that's going to be,

00:05:52.971 --> 00:05:55.291
that's going to be mostly managed by the durable

00:05:55.291 --> 00:05:57.331
objects built in APIs and we're going to build on

00:05:57.331 --> 00:05:57.891
top of that.

00:05:57.891 --> 00:05:58.161
So

00:05:58.551 --> 00:06:00.231
there's a few different concepts of state here.

00:06:00.261 --> 00:06:03.561
it's probably very hard to visualize exactly what

00:06:03.561 --> 00:06:04.921
this looks like and how it's going to be

00:06:04.921 --> 00:06:06.521
implemented just by looking at this.

00:06:06.521 --> 00:06:08.321
But I would just like keep note,

00:06:08.321 --> 00:06:08.881
we have state,

00:06:08.881 --> 00:06:09.641
we have SQL,

00:06:09.771 --> 00:06:12.691
SQLite table and then we also are going to be

00:06:12.691 --> 00:06:15.291
managing real time websocket connections.

00:06:15.561 --> 00:06:15.733
yeah,

00:06:15.733 --> 00:06:17.573
so that kind of sums up what we're going to be

00:06:17.573 --> 00:06:17.813
building.

00:06:18.053 --> 00:06:19.733
So now we're going to incrementally be building

00:06:19.733 --> 00:06:20.173
this out.

00:06:20.173 --> 00:06:21.208
So see you in the next one.

