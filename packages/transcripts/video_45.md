WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.076 --> 00:00:00.516
All right,

00:00:00.516 --> 00:00:03.236
let's go ahead and kill these applications that

00:00:03.236 --> 00:00:03.796
are running.

00:00:03.796 --> 00:00:06.196
I'm just going to move this over because we don't

00:00:06.196 --> 00:00:07.276
really need that for now.

00:00:07.786 --> 00:00:08.916
I'm going to purge these

00:00:09.396 --> 00:00:11.636
tabs for the time being and then

00:00:12.116 --> 00:00:14.236
right now we're going to mostly focus on the back

00:00:14.236 --> 00:00:14.476
end.

00:00:14.476 --> 00:00:15.396
So the data service.

00:00:15.636 --> 00:00:18.356
So let's head over to our data service

00:00:18.676 --> 00:00:20.196
and durable objects.

00:00:20.196 --> 00:00:21.316
Let's go into our

00:00:22.056 --> 00:00:22.976
link click tracker.

00:00:22.976 --> 00:00:25.376
So the next thing that we're going to do is we're

00:00:25.376 --> 00:00:28.056
going to actually build out that logic to send the

00:00:28.056 --> 00:00:30.416
link clicks to our client so they can show up on

00:00:30.416 --> 00:00:30.936
the screen.

00:00:31.096 --> 00:00:31.248
Now,

00:00:31.706 --> 00:00:33.666
essentially there's kind of a few different ways

00:00:33.666 --> 00:00:35.586
we can do it and the way that we're going to do it

00:00:35.586 --> 00:00:38.346
right now isn't necessarily like the absolute best

00:00:38.346 --> 00:00:39.306
solution possible,

00:00:39.306 --> 00:00:41.226
but I do think it's going to work and it's going

00:00:41.226 --> 00:00:42.586
to illustrate some concepts

00:00:42.746 --> 00:00:43.786
durable objects for us.

00:00:43.786 --> 00:00:46.586
So you know what we could do is we could at this

00:00:46.586 --> 00:00:46.906
level

00:00:47.196 --> 00:00:49.116
where whenever we add a link click,

00:00:49.276 --> 00:00:50.956
we could just simply like

00:00:51.466 --> 00:00:53.956
come into here and we could say like sockets

00:00:54.036 --> 00:00:54.596
equal,

00:00:55.146 --> 00:00:57.427
this.uh

00:00:57.945 --> 00:01:00.276
in.uhctx.

00:01:00.436 --> 00:01:00.836
get,

00:01:01.876 --> 00:01:02.835
get sockets.

00:01:03.236 --> 00:01:05.596
And then we could loop through the sockets one by

00:01:05.596 --> 00:01:07.476
one and send the,

00:01:07.876 --> 00:01:08.276
send,

00:01:08.276 --> 00:01:10.836
send this like link click event to each client

00:01:10.836 --> 00:01:11.956
that's currently connected.

00:01:12.546 --> 00:01:12.786
Now

00:01:13.106 --> 00:01:15.786
the downside here is if you imagine if you have

00:01:15.786 --> 00:01:18.346
like an enterprise level service where you are

00:01:18.346 --> 00:01:19.826
managing the link clicks for

00:01:20.466 --> 00:01:20.946
a very,

00:01:20.946 --> 00:01:21.186
very,

00:01:21.186 --> 00:01:21.906
very large,

00:01:22.066 --> 00:01:23.186
high volume company,

00:01:23.836 --> 00:01:24.236
and

00:01:24.716 --> 00:01:25.356
you have,

00:01:25.436 --> 00:01:28.076
let's say you have like every second you have,

00:01:28.156 --> 00:01:28.796
you know,

00:01:29.036 --> 00:01:31.156
5,000 clicks is what you're averaging.

00:01:31.156 --> 00:01:32.676
I don't really think that this service is

00:01:32.676 --> 00:01:33.756
necessarily going to do that.

00:01:33.756 --> 00:01:36.436
you wouldn't be using D1 as your database for

00:01:36.436 --> 00:01:36.636
that.

00:01:36.636 --> 00:01:36.956
But

00:01:37.436 --> 00:01:39.956
technically durable objects could scale in the,

00:01:40.026 --> 00:01:40.586
in that sense.

00:01:40.586 --> 00:01:42.546
You would just have to kind of like be a little

00:01:42.546 --> 00:01:44.146
bit methodical about how you implement it.

00:01:44.146 --> 00:01:46.266
So what we're going to actually do is we're going

00:01:46.266 --> 00:01:47.986
to kind of create a buffer and we're going to use

00:01:47.986 --> 00:01:50.506
a durable objects alarm to say whenever we get a

00:01:50.506 --> 00:01:52.506
link click we are going to go,

00:01:52.586 --> 00:01:54.546
we're going to like look two seconds into the

00:01:54.546 --> 00:01:54.826
future

00:01:55.226 --> 00:01:57.746
and then we're going to run an alarm and if alarm

00:01:57.746 --> 00:01:58.186
is set

00:01:58.586 --> 00:02:00.066
then we're not going to like,

00:02:00.066 --> 00:02:01.666
we're just going to save that data but we're not

00:02:01.666 --> 00:02:02.186
going to do anything.

00:02:02.186 --> 00:02:03.546
And that what's going to happen is like

00:02:03.866 --> 00:02:06.546
Instead of sending 5,000 events every second in

00:02:06.546 --> 00:02:07.546
this high volume,

00:02:07.966 --> 00:02:09.406
in this high Volume scenario.

00:02:09.646 --> 00:02:11.566
What you do is like you would just,

00:02:11.886 --> 00:02:13.566
you would wait for two seconds

00:02:13.886 --> 00:02:16.406
and then you would send like the buffer all those

00:02:16.406 --> 00:02:17.486
events down at once.

00:02:17.726 --> 00:02:19.326
So let's go ahead and

00:02:19.726 --> 00:02:20.446
kind of show,

00:02:20.526 --> 00:02:22.206
I'll show you exactly what we mean here.

00:02:22.206 --> 00:02:24.606
So what I'm going to do is I'm going to grab some

00:02:24.786 --> 00:02:25.706
the alarm code.

00:02:25.786 --> 00:02:28.026
So basically this is similar to the other durable

00:02:28.026 --> 00:02:31.026
objects where we are going to get an alarm and if

00:02:31.026 --> 00:02:33.306
we don't have an alarm we're just going to simply

00:02:33.916 --> 00:02:36.356
say let's set an alarm for two seconds into the

00:02:36.356 --> 00:02:36.596
future.

00:02:36.596 --> 00:02:39.196
That way our real time like data isn't delayed

00:02:39.196 --> 00:02:39.956
more than two seconds.

00:02:39.956 --> 00:02:41.956
Like that's not bad for like little specs to show

00:02:41.956 --> 00:02:42.636
up on a map.

00:02:43.006 --> 00:02:44.956
but this would help us scale in a scenario where

00:02:44.956 --> 00:02:46.396
we're not just like you know,

00:02:46.396 --> 00:02:48.236
overwhelming the data that's being sent to

00:02:48.236 --> 00:02:48.516
clients.

00:02:48.516 --> 00:02:49.876
We're kind of able to control that.

00:02:50.036 --> 00:02:50.436
So

00:02:51.156 --> 00:02:52.036
let's go like this

00:02:52.578 --> 00:02:55.138
and let's implement out the alarm.

00:02:55.138 --> 00:02:57.138
So basically the alarm is going to fire

00:02:59.770 --> 00:03:01.050
and when the alarm fires,

00:03:01.210 --> 00:03:02.570
right now it's just going to log it.

00:03:02.570 --> 00:03:04.610
But what we're going to want to do is we're going

00:03:04.610 --> 00:03:06.850
to want to grab our sockets and we're going to

00:03:06.850 --> 00:03:08.330
want to iterate through our sockets and we're

00:03:08.330 --> 00:03:09.210
going to send some data.

00:03:09.370 --> 00:03:11.930
So this is kind of like the crux of what it is.

00:03:12.250 --> 00:03:12.444
So

00:03:12.444 --> 00:03:13.497
let's grab our sockets

00:03:14.457 --> 00:03:17.297
so we can say this CTX get sockets.

00:03:17.297 --> 00:03:20.137
We're going to loop through each socket and then

00:03:20.377 --> 00:03:22.337
right now we don't have any data to send.

00:03:22.337 --> 00:03:24.337
But just imagine like right now we'd be sending

00:03:24.337 --> 00:03:24.937
empty data.

00:03:25.097 --> 00:03:25.497
So

00:03:26.174 --> 00:03:28.534
ideally the data that's passed into here is going

00:03:28.534 --> 00:03:29.474
to be a list of

00:03:29.474 --> 00:03:31.814
like a list of link click events that are going to

00:03:31.814 --> 00:03:32.974
be displayed on the ui.

00:03:32.974 --> 00:03:34.774
So this is going to send to each client.

00:03:34.934 --> 00:03:37.694
So typically only one client client is going to be

00:03:37.694 --> 00:03:38.014
connected.

00:03:38.014 --> 00:03:40.054
So there will only be one item in this array.

00:03:40.054 --> 00:03:42.534
But theoretically you could have multiple users

00:03:42.534 --> 00:03:44.654
under an organization all using this at once and

00:03:44.654 --> 00:03:46.054
this would cascade to all of them,

00:03:46.054 --> 00:03:46.994
which is a pretty cool

00:03:46.994 --> 00:03:48.554
which is pretty cool a way to implement

00:03:48.554 --> 00:03:49.274
WebSockets.

00:03:49.274 --> 00:03:49.634
Now

00:03:49.974 --> 00:03:51.354
there's a few different things here I'm just going

00:03:51.354 --> 00:03:52.354
to kind of like brush over.

00:03:52.354 --> 00:03:52.714
But

00:03:53.254 --> 00:03:54.934
I did mention earlier how

00:03:55.334 --> 00:03:57.434
we are going to have some type of

00:03:58.934 --> 00:04:00.574
Basically we're going to want to keep track of

00:04:00.574 --> 00:04:00.934
like

00:04:01.354 --> 00:04:04.354
the data that is in our SQLite table up here

00:04:04.434 --> 00:04:06.434
because we don't want this data to grow too Big

00:04:06.434 --> 00:04:08.434
like if there's a high volume client,

00:04:08.514 --> 00:04:10.794
we don't want them to have 3 million items in that

00:04:10.794 --> 00:04:11.274
database.

00:04:11.274 --> 00:04:13.194
We want to kind of limit it to like probably just

00:04:13.194 --> 00:04:14.594
a few hundred records at a time.

00:04:14.674 --> 00:04:17.074
Because you also don't want to send millions of

00:04:17.074 --> 00:04:18.474
objects over to the client,

00:04:18.474 --> 00:04:19.674
each client to like render.

00:04:19.674 --> 00:04:21.874
You probably want to keep that right around 100 or

00:04:21.874 --> 00:04:23.354
1000 depending on the use case.

00:04:23.354 --> 00:04:23.714
So

00:04:24.014 --> 00:04:25.454
essentially we're going to have references,

00:04:25.454 --> 00:04:27.134
we're going to have like a reference to

00:04:28.164 --> 00:04:29.684
like the last processed,

00:04:29.764 --> 00:04:31.604
the last processed offset

00:04:32.004 --> 00:04:33.524
and then the newest offset.

00:04:33.844 --> 00:04:36.804
And then during this two second buffer we're going

00:04:36.804 --> 00:04:37.444
to grab

00:04:38.004 --> 00:04:38.404
this

00:04:38.964 --> 00:04:40.924
like all of these records and we'll probably limit

00:04:40.924 --> 00:04:43.084
it to like 100 and we'll send them down to our

00:04:43.084 --> 00:04:43.524
clients.

00:04:44.244 --> 00:04:44.644
Now

00:04:45.124 --> 00:04:46.164
after that's done,

00:04:46.244 --> 00:04:47.364
we'll keep track of

00:04:47.684 --> 00:04:50.324
the most recent and this will become our last

00:04:50.404 --> 00:04:51.124
offset.

00:04:52.014 --> 00:04:54.174
And then every single time we add a new event,

00:04:54.734 --> 00:04:56.454
essentially what we'll be doing is we'll be

00:04:56.454 --> 00:04:58.734
looking at like the last like known event.

00:04:58.734 --> 00:05:01.094
So then every two seconds we'll just be sending

00:05:01.094 --> 00:05:03.134
like a buffer of these messages.

00:05:03.134 --> 00:05:05.094
So I have some code for that that we can go

00:05:05.094 --> 00:05:05.694
through right now.

00:05:05.694 --> 00:05:07.614
So first thing we're going to want to do is we're

00:05:07.614 --> 00:05:09.294
going to want to keep track of those offsets.

00:05:09.374 --> 00:05:11.854
So at the top level of our durable object,

00:05:12.094 --> 00:05:13.894
let's go ahead and define some in memory

00:05:13.894 --> 00:05:14.414
variables,

00:05:14.414 --> 00:05:17.134
most recent offset and last offset time.

00:05:17.454 --> 00:05:20.934
And then inside of our block while let's go ahead

00:05:20.934 --> 00:05:22.734
and just make sure we pull those from stor.

00:05:23.354 --> 00:05:24.634
So we are just grabbing

00:05:24.754 --> 00:05:27.194
least recent offset time and most recent offset

00:05:27.194 --> 00:05:30.034
time from storage and then we're saving it here

00:05:30.994 --> 00:05:33.154
and then we can go ahead and just set it.

00:05:33.154 --> 00:05:35.314
So I'm just going to say if

00:05:36.382 --> 00:05:38.222
should probably put this indented.

00:05:38.222 --> 00:05:41.182
So basically we're going to say if there,

00:05:41.662 --> 00:05:42.822
if this is undefined.

00:05:42.822 --> 00:05:44.302
So if this has never been set before,

00:05:44.302 --> 00:05:45.757
which it actually shouldn't be the key.

00:05:45.862 --> 00:05:46.182
So yeah,

00:05:46.182 --> 00:05:47.142
if this hasn't been set before,

00:05:47.142 --> 00:05:48.582
we're just going to default it to zero.

00:05:48.982 --> 00:05:52.102
We could technically also just like default it to

00:05:52.822 --> 00:05:53.702
this dot,

00:05:53.762 --> 00:05:55.242
least and this top most.

00:05:56.122 --> 00:05:57.248
I think this is also fine.

00:05:59.318 --> 00:06:00.878
Now what we're going to do,

00:06:00.878 --> 00:06:02.678
now that we are keeping track of offsets,

00:06:02.678 --> 00:06:04.278
we're going to have some helper methods.

00:06:04.278 --> 00:06:06.598
So inside of our alarm we're going to want to do a

00:06:06.598 --> 00:06:07.118
few things.

00:06:07.118 --> 00:06:08.918
We are going to want to grab

00:06:10.308 --> 00:06:11.428
an array of the recent

00:06:11.728 --> 00:06:14.228
of like the of recent clicks and we're going to

00:06:14.228 --> 00:06:17.062
use our most recent Offset time for that.

00:06:17.344 --> 00:06:20.184
So in order to get these link the link click data,

00:06:20.184 --> 00:06:22.384
since we're technically saving it in our table,

00:06:22.384 --> 00:06:24.864
we're going to pull it from our table and what I'm

00:06:24.864 --> 00:06:27.024
going to do is I'm going to create a new

00:06:27.344 --> 00:06:27.824
file

00:06:28.384 --> 00:06:30.064
inside of our helpers called

00:06:31.124 --> 00:06:32.104
durable queries.

00:06:32.864 --> 00:06:34.544
So we can head over to our helpers

00:06:35.024 --> 00:06:37.584
and let's just say durable queries ts

00:06:37.904 --> 00:06:39.584
and what this and what we're going to have,

00:06:39.584 --> 00:06:41.224
I'm just going to paste this in for the purpose of

00:06:41.224 --> 00:06:42.224
time and go over it.

00:06:42.224 --> 00:06:45.224
So essentially what we have here is we have a

00:06:45.224 --> 00:06:46.784
query that just selects

00:06:47.184 --> 00:06:47.784
latitude,

00:06:47.784 --> 00:06:48.303
longitude,

00:06:48.303 --> 00:06:49.104
country and time

00:06:49.424 --> 00:06:50.864
from geoclicks,

00:06:50.964 --> 00:06:53.924
geolink clicks and then it's filtering based upon

00:06:54.184 --> 00:06:55.874
where time is greater than a certain

00:06:56.274 --> 00:06:58.394
amount and a limit of an offset.

00:06:58.394 --> 00:06:59.314
So at

00:06:59.824 --> 00:07:01.624
the top level of this function we're going to be

00:07:01.624 --> 00:07:03.224
passing in a offset time.

00:07:03.224 --> 00:07:04.464
It's going to default to zero.

00:07:05.074 --> 00:07:06.824
and this is a scenario where you'd want to pull

00:07:06.824 --> 00:07:09.144
all of the link clicks inside of that table

00:07:09.464 --> 00:07:11.344
and then what we're going to do is we're going to

00:07:11.344 --> 00:07:12.264
limit it by 50,

00:07:12.414 --> 00:07:13.094
as a default.

00:07:13.094 --> 00:07:15.494
And then this could be kind of passed in from the

00:07:15.494 --> 00:07:16.614
user of this function.

00:07:16.614 --> 00:07:17.614
So the durable object,

00:07:17.614 --> 00:07:19.134
if we wanted to give like more,

00:07:19.134 --> 00:07:22.414
so like maybe 50 isn't enough like specs on a map,

00:07:22.414 --> 00:07:23.614
maybe we want a thousand,

00:07:23.614 --> 00:07:25.774
we could tweak this number as well when we use

00:07:25.774 --> 00:07:26.414
this function.

00:07:27.154 --> 00:07:28.914
and then essentially what we're going to be doing

00:07:28.914 --> 00:07:30.734
is we're going to be passing in this query query

00:07:30.734 --> 00:07:32.814
right here into our SQL storage

00:07:33.094 --> 00:07:33.534
query

00:07:33.854 --> 00:07:36.174
and then we're going to pass in the binding.

00:07:36.334 --> 00:07:38.094
So this is the filter for time,

00:07:38.334 --> 00:07:40.334
which is the offset time and then this is the

00:07:40.334 --> 00:07:41.734
filter for the limit.

00:07:42.214 --> 00:07:43.974
And then we're just doing a few different things

00:07:43.974 --> 00:07:44.254
here.

00:07:44.254 --> 00:07:45.174
I have a

00:07:45.534 --> 00:07:46.194
I have a

00:07:47.917 --> 00:07:48.957
a Zod

00:07:49.029 --> 00:07:51.828
schema that we've defined inside of our repo.

00:07:51.828 --> 00:07:53.148
You should already have it

00:07:53.418 --> 00:07:54.858
and if you don't have it,

00:07:55.258 --> 00:07:56.208
you really should have it.

00:07:56.218 --> 00:07:58.298
I'm just going to make sure if you don't have it,

00:07:58.378 --> 00:07:58.938
what we,

00:07:59.338 --> 00:07:59.818
what you.

00:07:59.818 --> 00:08:00.858
So you can see what it looks like.

00:08:00.858 --> 00:08:03.018
So it is going to be inside of

00:08:03.548 --> 00:08:03.948
our,

00:08:04.144 --> 00:08:06.837
inside of our Data Ops package.

00:08:07.317 --> 00:08:08.677
In Source Zod

00:08:08.997 --> 00:08:11.717
links we have this durable object

00:08:11.877 --> 00:08:14.097
link schema which you should have this already in

00:08:14.097 --> 00:08:14.377
there.

00:08:14.397 --> 00:08:16.227
and if you don't just go ahead and

00:08:16.547 --> 00:08:18.547
type this guy out and export it,

00:08:18.547 --> 00:08:18.867
build.

00:08:18.947 --> 00:08:19.347
But

00:08:19.827 --> 00:08:21.767
we're basically using that so we can have a very

00:08:21.767 --> 00:08:23.487
Structured type that is being

00:08:23.827 --> 00:08:25.577
sent over to the client.

00:08:25.657 --> 00:08:26.377
And then

00:08:27.097 --> 00:08:29.577
we're going to grab the very first item in that

00:08:29.577 --> 00:08:30.057
array

00:08:30.537 --> 00:08:33.777
and we're going to get the time default to zero if

00:08:33.777 --> 00:08:34.857
the array is empty.

00:08:35.097 --> 00:08:37.097
And then similarly we're going to go grab the last

00:08:37.097 --> 00:08:39.097
item in that array and we're going to

00:08:39.397 --> 00:08:40.787
grab the time and default.

00:08:41.277 --> 00:08:41.548
if,

00:08:41.680 --> 00:08:42.000
if there,

00:08:42.000 --> 00:08:44.280
if there is no items in this like array,

00:08:44.280 --> 00:08:45.760
meaning there are no link clicks,

00:08:45.760 --> 00:08:46.960
it'll default to zero.

00:08:47.040 --> 00:08:48.640
And what that's going to give us is this going to

00:08:48.640 --> 00:08:50.760
return this object where we have a list of our

00:08:50.760 --> 00:08:51.600
link objects,

00:08:51.680 --> 00:08:52.720
our link clicks.

00:08:52.960 --> 00:08:54.960
We have the most recent time and we have the

00:08:54.960 --> 00:08:55.560
oldest time.

00:08:55.560 --> 00:08:57.080
And this is going to help us keep track of those

00:08:57.080 --> 00:08:58.440
offsets that I mentioned before.

00:08:58.440 --> 00:08:59.835
So we can go ahead and save this,

00:08:59.835 --> 00:09:00.900
head back over here.

00:09:01.300 --> 00:09:01.700
And

00:09:02.000 --> 00:09:04.640
what we can do is we can say link click data and

00:09:04.640 --> 00:09:05.880
we're going to pass in this information.

00:09:06.200 --> 00:09:07.640
So link click data.

00:09:08.373 --> 00:09:08.813
So get,

00:09:08.813 --> 00:09:09.173
re.

00:09:09.653 --> 00:09:10.293
Get recent,

00:09:11.093 --> 00:09:14.373
get recent link clicks pass in our sequel,

00:09:14.863 --> 00:09:15.333
reference.

00:09:15.333 --> 00:09:17.973
And then we're going to pass in the most recent

00:09:18.053 --> 00:09:18.834
offset time.

00:09:20.441 --> 00:09:23.241
Then what we're going to do is we can define a

00:09:23.241 --> 00:09:27.121
function at our durable object level to flush our

00:09:27.121 --> 00:09:27.881
offset times.

00:09:27.881 --> 00:09:30.041
And what this is going to do is it's basically

00:09:30.041 --> 00:09:32.361
going to take like the most recent and our least

00:09:32.551 --> 00:09:33.621
recent offset time,

00:09:34.501 --> 00:09:34.981
set them

00:09:35.271 --> 00:09:37.611
in memory and then flush them into storage.

00:09:38.011 --> 00:09:40.731
Reason why we are doing this is just so like we

00:09:40.731 --> 00:09:42.811
can keep the sliding window of

00:09:43.081 --> 00:09:45.581
offsets as we buffered this data and send it to

00:09:45.581 --> 00:09:46.021
clients.

00:09:46.821 --> 00:09:47.221
Now,

00:09:48.671 --> 00:09:50.551
the way that we're going to use that is inside of

00:09:50.551 --> 00:09:52.831
our alarm based upon the link click data.

00:09:53.061 --> 00:09:53.331
the

00:09:53.362 --> 00:09:54.638
most recent time,

00:09:54.709 --> 00:09:57.269
the most recent time that was found from the

00:09:57.269 --> 00:09:59.989
actual data that we are processing will now become

00:09:59.989 --> 00:10:01.189
our new most recent time.

00:10:01.429 --> 00:10:04.149
And then our oldest time is going to also come

00:10:04.149 --> 00:10:05.509
from our link click data.

00:10:05.589 --> 00:10:08.629
So if we ever had like a burst of 20,000 link

00:10:08.629 --> 00:10:09.189
clicks,

00:10:09.429 --> 00:10:11.549
we don't need to keep all of that into memory.

00:10:11.549 --> 00:10:13.749
We're just going to grab that like little subset

00:10:13.749 --> 00:10:15.469
of whatever we define here.

00:10:15.469 --> 00:10:15.829
And

00:10:16.149 --> 00:10:16.949
we could define,

00:10:16.949 --> 00:10:17.189
right,

00:10:17.189 --> 00:10:18.309
it defaults to 50.

00:10:18.709 --> 00:10:20.749
This is like the limited number of records that

00:10:20.749 --> 00:10:21.589
are returned here.

00:10:21.829 --> 00:10:22.949
We could pass 100.

00:10:22.949 --> 00:10:23.829
It really doesn't matter.

00:10:23.829 --> 00:10:26.129
It's entirely up to the way that we want implement

00:10:26.129 --> 00:10:26.449
this.

00:10:27.120 --> 00:10:30.360
now the last thing that I want to do is I want to

00:10:30.360 --> 00:10:31.760
clean up our table.

00:10:31.840 --> 00:10:34.720
So if there's a scenario where you know,

00:10:34.720 --> 00:10:37.080
we get 50,000 link clicks and just a burst of like

00:10:37.080 --> 00:10:39.360
one processing unit like two seconds.

00:10:39.600 --> 00:10:41.400
I don't want to store a whole bunch of data in

00:10:41.400 --> 00:10:43.520
this SQLite database because there are limits

00:10:43.520 --> 00:10:43.840
there.

00:10:44.060 --> 00:10:47.140
I want to delete any of the records that we don't

00:10:47.140 --> 00:10:47.420
need.

00:10:47.580 --> 00:10:50.420
So what we can do is we can head back over to our

00:10:50.420 --> 00:10:51.340
durable queries

00:10:51.630 --> 00:10:52.510
and then we have a,

00:10:52.510 --> 00:10:54.110
we can define a query to delete.

00:10:54.110 --> 00:10:54.510
So

00:10:54.830 --> 00:10:57.790
all we have to do is we basically say delete link

00:10:57.790 --> 00:11:00.910
clicks before we pass in our reference to our SQL

00:11:01.260 --> 00:11:01.900
storage

00:11:02.380 --> 00:11:04.860
and then our SQL storage client and then we pass

00:11:04.860 --> 00:11:07.060
in a time and basically anything that is

00:11:07.060 --> 00:11:09.000
less than that time is going to be deleted.

00:11:09.560 --> 00:11:09.960
So

00:11:10.280 --> 00:11:13.280
we can then use this inside of our alarm and say

00:11:13.280 --> 00:11:13.880
await

00:11:14.684 --> 00:11:15.404
delete before

00:11:15.717 --> 00:11:15.957
and

00:11:17.267 --> 00:11:17.897
we can

00:11:18.210 --> 00:11:19.010
pass in

00:11:19.490 --> 00:11:21.650
the oldest time and the

00:11:21.970 --> 00:11:25.410
SQL reference so this dot SQL and then we're going

00:11:25.410 --> 00:11:27.490
to pass in click data oldest time.

00:11:27.650 --> 00:11:29.890
So this is going to just keep that

00:11:29.990 --> 00:11:32.050
table truncated with just the most recent like

00:11:32.050 --> 00:11:32.850
link clicks.

00:11:33.250 --> 00:11:35.650
And then one thing that I'm noticing here as I'm

00:11:35.650 --> 00:11:36.610
typing it out is

00:11:37.360 --> 00:11:40.280
essentially when we iterate through our sockets we

00:11:40.280 --> 00:11:41.440
can pass in our

00:11:42.420 --> 00:11:44.180
link click data dot clicks.

00:11:44.180 --> 00:11:46.020
This is really the data that we want to send over

00:11:46.020 --> 00:11:46.900
to each client.

00:11:47.060 --> 00:11:47.460
Now

00:11:47.860 --> 00:11:50.620
I don't know like these operations should be very

00:11:50.620 --> 00:11:51.220
very quick

00:11:51.620 --> 00:11:52.900
but at the same time

00:11:53.220 --> 00:11:54.740
we don't necessarily like,

00:11:55.060 --> 00:11:57.180
we want to get this data to the client as fast as

00:11:57.180 --> 00:11:57.460
possible.

00:11:57.860 --> 00:12:01.140
So what I would opt to do is say let's move our

00:12:01.940 --> 00:12:02.940
let's move our

00:12:03.500 --> 00:12:05.020
sending the data to the clients

00:12:05.660 --> 00:12:08.220
up a little bit in this logic chain.

00:12:09.360 --> 00:12:10.760
So we'll basically grab the link click,

00:12:10.760 --> 00:12:12.040
we'll grab some information about it,

00:12:12.040 --> 00:12:14.360
we'll send all that information to the client and

00:12:14.360 --> 00:12:16.200
then we'll go ahead and we'll start cleaning stuff

00:12:16.200 --> 00:12:16.440
up.

00:12:16.440 --> 00:12:17.760
So that's what's happening here.

00:12:17.760 --> 00:12:18.160
So

00:12:18.410 --> 00:12:20.940
I'm just gonna pause for just a second just so you

00:12:20.940 --> 00:12:22.140
can kind of look over this.

00:12:22.746 --> 00:12:25.066
But at this point we should be able to

00:12:25.706 --> 00:12:28.866
deploy these changes and then wire it up into our

00:12:28.866 --> 00:12:29.335
ui.

00:12:29.480 --> 00:12:31.240
So let's go ahead and deploy it.

00:12:33.800 --> 00:12:35.880
And while this is deploying what I'm going to do

00:12:35.880 --> 00:12:37.080
is I'm going to spin up this

00:12:37.515 --> 00:12:38.388
user application.

00:12:38.388 --> 00:12:40.668
So this is the front end application run dev.

00:12:41.788 --> 00:12:45.708
Then I'm going to copy our data service URL

00:12:46.428 --> 00:12:48.748
and I'm just going to head over temporarily.

00:12:48.748 --> 00:12:50.108
I'm going to head over to our

00:12:50.818 --> 00:12:52.578
our click socket code.

00:12:52.578 --> 00:12:53.778
So this is living in our front end.

00:12:53.778 --> 00:12:54.898
And right now we have this

00:12:55.538 --> 00:12:55.858
vite,

00:12:56.468 --> 00:12:57.668
we have basically this

00:12:58.068 --> 00:12:58.788
vite variable.

00:12:58.788 --> 00:13:01.188
I'm just Going to override it just for a little

00:13:01.188 --> 00:13:01.655
bit here.

00:13:01.746 --> 00:13:02.146
And

00:13:02.786 --> 00:13:03.586
I'm also,

00:13:03.586 --> 00:13:05.786
because this is actually the protocol is going to

00:13:05.786 --> 00:13:06.066
be

00:13:06.846 --> 00:13:07.566
wss.

00:13:07.726 --> 00:13:10.325
I'm just going to have this default also come over

00:13:10.325 --> 00:13:12.446
to WSS just for the time being.

00:13:13.166 --> 00:13:15.166
Now when we open up this application

00:13:15.646 --> 00:13:16.743
and we head over here,

00:13:16.791 --> 00:13:18.951
I'm going to open up and inspect our network

00:13:18.951 --> 00:13:19.446
traffic.

00:13:19.556 --> 00:13:21.460
Now you can notice that it went from disconnected

00:13:21.460 --> 00:13:22.100
to connected

00:13:22.500 --> 00:13:23.620
and we have

00:13:24.019 --> 00:13:24.420
our

00:13:25.120 --> 00:13:27.100
client connection established.

00:13:27.100 --> 00:13:28.740
So here's our client socket right here.

00:13:29.300 --> 00:13:31.860
Now what I'm going to do is I'm going to

00:13:34.430 --> 00:13:36.630
I'm going to use this link that we have.

00:13:36.630 --> 00:13:38.350
So this should redirect us to Google

00:13:39.070 --> 00:13:40.790
and then when we do that what you're going to

00:13:40.790 --> 00:13:42.470
notice is look at that,

00:13:42.470 --> 00:13:44.910
we have a spec pop up here.

00:13:45.150 --> 00:13:48.110
So we can also probably inspect the messages that

00:13:48.110 --> 00:13:48.590
came through.

00:13:48.670 --> 00:13:51.190
So if we come here you can see that we got this

00:13:51.190 --> 00:13:53.470
message sent from the client which is pretty cool.

00:13:53.470 --> 00:13:54.750
So these message,

00:13:54.910 --> 00:13:57.446
these messages went from our durable object

00:13:57.446 --> 00:13:59.144
to our client side code.

00:13:59.424 --> 00:14:00.464
And I'm just going to,

00:14:01.127 --> 00:14:03.287
just going to do that one more time.

00:14:03.527 --> 00:14:05.190
So I'm going to hit this one more time

00:14:05.301 --> 00:14:07.202
and you can see the spec actually got a little bit

00:14:07.202 --> 00:14:07.482
bigger.

00:14:07.482 --> 00:14:09.802
I put a little bit of logic into here to basically

00:14:09.802 --> 00:14:13.162
say like if there's dots that are close to each

00:14:13.162 --> 00:14:13.482
other,

00:14:13.722 --> 00:14:15.242
make those dots a little bit bigger.

00:14:15.242 --> 00:14:17.602
So the more users the larger that circle is going

00:14:17.602 --> 00:14:17.962
to be.

00:14:17.962 --> 00:14:21.082
Now if you also had a scenario where like

00:14:21.442 --> 00:14:22.202
you have a vpn,

00:14:22.202 --> 00:14:23.882
I'd say go connect to like a few different

00:14:23.882 --> 00:14:24.322
locations.

00:14:24.322 --> 00:14:25.802
I'll probably just do that really fast.

00:14:25.802 --> 00:14:26.582
Right now

00:14:27.142 --> 00:14:27.942
let's go to

00:14:29.062 --> 00:14:30.102
NordVPN.

00:14:31.928 --> 00:14:33.518
I'm going to click to connect to Malaysia.

00:14:33.518 --> 00:14:33.966
Really quick.

00:14:33.966 --> 00:14:34.868
Looks like I'm connected.

00:14:35.268 --> 00:14:36.468
I'm going to do this again

00:14:37.668 --> 00:14:38.068
and

00:14:38.468 --> 00:14:39.508
come back over here

00:14:39.908 --> 00:14:41.348
and we should see a,

00:14:41.908 --> 00:14:43.028
we should see a

00:14:43.888 --> 00:14:46.528
spec pop up if we come over to Asia.

00:14:47.810 --> 00:14:48.130
Oh,

00:14:48.210 --> 00:14:49.170
hasn't connected yet.

00:14:49.170 --> 00:14:49.730
That's why.

00:14:52.140 --> 00:14:52.529
All right,

00:14:52.529 --> 00:14:53.409
now I'm connected.

00:14:53.649 --> 00:14:55.249
So let's try that one more time.

00:14:55.409 --> 00:14:57.129
Data ops go to that link.

00:14:57.129 --> 00:14:59.369
This one will redirect us to LinkedIn because this

00:14:59.369 --> 00:14:59.744
is a

00:14:59.924 --> 00:15:01.334
a Malaysia based URL

00:15:01.432 --> 00:15:01.452
all

00:15:01.452 --> 00:15:01.592
right.

00:15:01.592 --> 00:15:02.312
And there we go.

00:15:02.312 --> 00:15:02.792
Yeah,

00:15:02.792 --> 00:15:04.432
it just took a second to show up.

00:15:04.432 --> 00:15:06.032
It was actually really small so I couldn't see it.

00:15:06.032 --> 00:15:06.312
But

00:15:06.792 --> 00:15:09.112
so you notice now we are on our VPN

00:15:09.512 --> 00:15:12.552
and we clicked on a link from

00:15:13.528 --> 00:15:15.208
we connect to a VPN in Malaysia,

00:15:15.208 --> 00:15:16.728
clicked on the link and then we got

00:15:17.008 --> 00:15:19.008
redirected to LinkedIn instead of Google because

00:15:19.008 --> 00:15:19.968
that's kind of what it was.

00:15:19.968 --> 00:15:21.688
And now you can see in Malaysia we have this

00:15:21.688 --> 00:15:23.288
little spec that's saying hey,

00:15:23.288 --> 00:15:23.848
we are,

00:15:23.848 --> 00:15:24.688
we had users here.

00:15:24.688 --> 00:15:26.688
And I'm going to do this one more time

00:15:28.048 --> 00:15:30.328
and we should see this link just got a little bit

00:15:30.328 --> 00:15:30.568
bigger.

00:15:30.568 --> 00:15:31.128
If you notice.

00:15:31.128 --> 00:15:32.448
It's probably kind of hard to see from here,

00:15:32.448 --> 00:15:33.208
but yeah,

00:15:33.208 --> 00:15:33.808
so it's working.

00:15:33.808 --> 00:15:34.208
Our.

00:15:34.368 --> 00:15:36.288
I'm going to disconnect from this again

00:15:36.453 --> 00:15:38.756
and I will do this one more time.

00:15:38.836 --> 00:15:39.316
Boom.

00:15:39.772 --> 00:15:42.692
Now I actually think what happens is when I change

00:15:42.692 --> 00:15:43.532
my vpn,

00:15:43.532 --> 00:15:45.652
I think that we are disconnecting and then

00:15:45.652 --> 00:15:46.252
reconnecting.

00:15:46.252 --> 00:15:46.482
But

00:15:46.482 --> 00:15:46.742
yeah,

00:15:46.742 --> 00:15:47.382
so this is,

00:15:47.436 --> 00:15:48.756
so this is working as expected.

00:15:48.836 --> 00:15:49.476
We have

00:15:49.856 --> 00:15:50.256
a,

00:15:50.816 --> 00:15:52.496
essentially the flow looks like this.

00:15:52.576 --> 00:15:53.536
We have a,

00:15:54.336 --> 00:15:55.616
we have a user that

00:15:55.956 --> 00:15:57.236
clicks on our link,

00:15:57.316 --> 00:15:58.156
goes to hono,

00:15:58.156 --> 00:16:00.076
API redirects to where they're supposed to be.

00:16:00.076 --> 00:16:01.316
This data sent to a queue.

00:16:01.316 --> 00:16:02.916
It's also sent to our durable object.

00:16:02.916 --> 00:16:05.916
Every two seconds our durable object is going to

00:16:05.916 --> 00:16:08.716
trigger an alarm and that's going to send data to

00:16:08.716 --> 00:16:10.716
the clients that are connected via websockets.

00:16:10.716 --> 00:16:12.836
Now those web sockets kind of look like this.

00:16:13.156 --> 00:16:13.716
You have

00:16:14.466 --> 00:16:16.386
a link click data that gets put into here.

00:16:16.866 --> 00:16:19.426
It is going to save that data into this table

00:16:19.826 --> 00:16:22.706
and alarm is going to manage these offsets just so

00:16:22.786 --> 00:16:24.986
the data can't grow infinitely inside of our

00:16:24.986 --> 00:16:25.266
table.

00:16:25.266 --> 00:16:27.576
And then in those two second buffer it's going to

00:16:27.806 --> 00:16:30.126
push that data to whatever client is connected.

00:16:30.286 --> 00:16:31.926
So I hope that makes sense.

00:16:31.926 --> 00:16:33.686
This is actually a super cool feature in my

00:16:33.686 --> 00:16:34.606
opinion and

00:16:34.636 --> 00:16:36.746
I do think it's a pretty good use case for durable

00:16:36.746 --> 00:16:37.146
objects.

00:16:37.146 --> 00:16:38.626
I think you're able to kind of holistically

00:16:38.626 --> 00:16:38.946
understand

00:16:39.506 --> 00:16:41.866
how this entire like thing works.

00:16:41.866 --> 00:16:43.346
Now just one last thing.

00:16:43.346 --> 00:16:46.146
I'm on my phone so I'm going to

00:16:47.068 --> 00:16:49.813
I'm going to hit this endpoint from my phone

00:16:50.293 --> 00:16:50.693
to.

00:16:51.070 --> 00:16:52.590
Let's move this over to

00:16:53.550 --> 00:16:54.350
Americas.

00:16:57.383 --> 00:16:58.463
Now when I hit enter,

00:16:58.463 --> 00:16:59.623
we should see it,

00:16:59.694 --> 00:17:01.574
we should see it pop up over in

00:17:01.974 --> 00:17:04.334
the US So you see right here we're able to see

00:17:04.334 --> 00:17:05.014
that little spec.

00:17:05.014 --> 00:17:07.454
That's where I am in the US and my phone's not on

00:17:07.454 --> 00:17:08.054
the vpn.

00:17:08.134 --> 00:17:09.134
So yeah,

00:17:09.134 --> 00:17:09.614
this is working.

00:17:09.614 --> 00:17:10.534
This is pretty cool.

00:17:11.950 --> 00:17:14.390
Now I would say before the next section I would

00:17:14.390 --> 00:17:16.790
just come into your client code and I would just

00:17:16.790 --> 00:17:19.310
make sure you revert this and you revert this.

00:17:19.500 --> 00:17:20.040
just for the

00:17:20.440 --> 00:17:21.880
the sake of getting things clean.

00:17:21.880 --> 00:17:23.560
And then in this next video we're actually going

00:17:23.560 --> 00:17:26.240
to start proxying the request from our worker

00:17:26.240 --> 00:17:28.760
that's associated with our UI application,

00:17:29.000 --> 00:17:30.600
and that's going to be proxy to our durable

00:17:30.600 --> 00:17:31.080
object.

00:17:31.160 --> 00:17:32.426
So catch on that one.

