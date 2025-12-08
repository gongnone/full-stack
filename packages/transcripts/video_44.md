WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.000 --> 00:00:00.436
All right,

00:00:00.436 --> 00:00:02.316
so now before we keep building this out,

00:00:02.476 --> 00:00:05.916
let's go ahead and ensure that this is all working

00:00:05.916 --> 00:00:07.956
locally and that our websocket connection is

00:00:07.956 --> 00:00:09.836
actually reaching our durable object.

00:00:09.916 --> 00:00:11.676
So what we can do is

00:00:11.996 --> 00:00:13.036
I'm going to

00:00:13.516 --> 00:00:15.196
open a new terminal here

00:00:15.756 --> 00:00:18.476
and I'm going to CD into user application.

00:00:18.716 --> 00:00:22.076
So let's just go back one CD user application

00:00:22.396 --> 00:00:24.236
and then I'm going to go ahead and run this guy.

00:00:24.236 --> 00:00:25.916
So pnpm run dev.

00:00:27.274 --> 00:00:27.514
Now

00:00:28.314 --> 00:00:30.034
in this side we're also in the data service

00:00:30.034 --> 00:00:30.554
application,

00:00:30.554 --> 00:00:32.274
so I'm going to go ahead and start this up as

00:00:32.274 --> 00:00:32.474
well.

00:00:32.474 --> 00:00:33.274
Pnpm.

00:00:39.274 --> 00:00:39.754
Alright,

00:00:39.754 --> 00:00:41.114
so now that both of these are running,

00:00:41.193 --> 00:00:43.474
what we're going to want to do is we're going to

00:00:43.474 --> 00:00:46.154
want to head over to our user application and

00:00:46.154 --> 00:00:48.154
inside of our user application we should have

00:00:48.154 --> 00:00:48.874
these hooks

00:00:49.274 --> 00:00:50.954
and there's a file called

00:00:51.302 --> 00:00:52.102
click sockets.

00:00:52.102 --> 00:00:54.062
Right now this is just kind of like a dummy hook

00:00:54.062 --> 00:00:55.062
that doesn't do anything.

00:00:55.062 --> 00:00:58.022
But ultimately what happens is inside of our

00:00:58.022 --> 00:00:58.662
dashboard

00:00:59.062 --> 00:01:02.662
we have these maps and these maps are utilizing a

00:01:03.062 --> 00:01:04.272
geoclick store,

00:01:04.272 --> 00:01:05.462
which is ultimately being

00:01:06.022 --> 00:01:07.012
powered by the,

00:01:07.232 --> 00:01:08.032
by our,

00:01:08.112 --> 00:01:09.712
our client socket.

00:01:09.712 --> 00:01:11.712
So we can go ahead and actually search

00:01:12.272 --> 00:01:14.632
inside of our project if you want to see exactly

00:01:14.632 --> 00:01:15.552
where this is utilized.

00:01:15.552 --> 00:01:15.872
But

00:01:16.522 --> 00:01:17.482
inside of our

00:01:17.742 --> 00:01:18.762
index ts,

00:01:18.842 --> 00:01:21.482
we are going to be establishing a connection

00:01:21.882 --> 00:01:23.242
at the root component.

00:01:23.242 --> 00:01:25.082
So essentially right when the component loads,

00:01:25.082 --> 00:01:26.602
we're going to try to reach out to our

00:01:26.782 --> 00:01:27.322
server.

00:01:27.322 --> 00:01:27.722
So

00:01:28.042 --> 00:01:29.962
let's just go ahead and look at this file.

00:01:29.962 --> 00:01:31.442
So right now it's not doing anything.

00:01:31.442 --> 00:01:33.482
And if you look at

00:01:33.962 --> 00:01:35.642
this guy running on localhost,

00:01:39.576 --> 00:01:40.976
I'm just going to make sure that this is running

00:01:40.976 --> 00:01:41.896
on Port 3000

00:01:42.284 --> 00:01:43.724
so we should be able to open this.

00:01:44.284 --> 00:01:45.652
Might take a second to load,

00:01:45.652 --> 00:01:46.707
but once it spins up,

00:01:46.707 --> 00:01:48.014
let's head over to our dashboard

00:01:48.014 --> 00:01:50.031
and what we're going to notice is there's this

00:01:50.031 --> 00:01:52.511
little flag right here that says disconnected.

00:01:52.871 --> 00:01:54.831
if we open up our

00:01:56.191 --> 00:01:58.591
console we can head over to the network tab as

00:01:58.591 --> 00:01:58.831
well.

00:01:59.561 --> 00:02:01.121
And what we're going to do is we're going to build

00:02:01.121 --> 00:02:04.241
out some logic to manage this web socket.

00:02:04.241 --> 00:02:06.201
Now I actually already have the code for that.

00:02:06.511 --> 00:02:07.941
this is just a bunch of boilerplate.

00:02:07.941 --> 00:02:09.741
I'll skim over it really quickly so you know

00:02:09.741 --> 00:02:10.301
what's happening.

00:02:10.301 --> 00:02:12.821
But don't pay too much attention because there are

00:02:12.821 --> 00:02:14.701
like also libraries that help you manage

00:02:14.851 --> 00:02:15.961
WebSocket connections.

00:02:15.961 --> 00:02:16.321
So

00:02:16.641 --> 00:02:18.601
essentially what we're doing is we're having a few

00:02:18.601 --> 00:02:19.721
different state variables.

00:02:19.721 --> 00:02:21.921
But the main focus here Is we have a

00:02:22.091 --> 00:02:22.921
websocket.

00:02:23.321 --> 00:02:23.721
Now

00:02:24.011 --> 00:02:25.811
when the component mounts for the very first time,

00:02:25.811 --> 00:02:27.451
what we do is we are going to

00:02:28.051 --> 00:02:31.631
pass in the path to our websocket and the host and

00:02:31.631 --> 00:02:33.311
the protocol which is going to be

00:02:34.311 --> 00:02:37.671
WS if you're developing locally and then websocket

00:02:37.671 --> 00:02:39.031
secure if you are

00:02:39.641 --> 00:02:41.721
if you are actually running in production and it's

00:02:41.721 --> 00:02:42.761
just basically looking at

00:02:43.161 --> 00:02:43.561
your

00:02:43.961 --> 00:02:45.001
window protocol.

00:02:45.001 --> 00:02:48.001
So like if you're like on HTTPs it's going to go

00:02:48.001 --> 00:02:48.921
to wwe.

00:02:48.921 --> 00:02:50.441
If not it will be wc.

00:02:50.441 --> 00:02:50.841
Now

00:02:51.251 --> 00:02:51.811
from here

00:02:52.022 --> 00:02:53.622
essentially on open

00:02:54.022 --> 00:02:56.102
we are just going to be setting that connected as

00:02:56.102 --> 00:02:56.502
true

00:02:57.062 --> 00:02:58.102
and then

00:02:58.412 --> 00:03:00.862
whenever it receives a message it's going to be

00:03:00.862 --> 00:03:03.342
getting that message from the server and it's

00:03:03.342 --> 00:03:04.502
going to be passing that data

00:03:04.972 --> 00:03:07.962
into an ad clicks which is ultimately going from

00:03:07.962 --> 00:03:09.402
this like Zustan store.

00:03:09.402 --> 00:03:10.762
So I know I'm covering a lot.

00:03:10.762 --> 00:03:12.282
These are all things that are kind of like beyond

00:03:12.282 --> 00:03:13.082
the scope of this course.

00:03:13.082 --> 00:03:15.602
But we do have this component that is managing

00:03:15.602 --> 00:03:17.362
state and then that state is going to be reflected

00:03:17.362 --> 00:03:18.202
through the application.

00:03:18.202 --> 00:03:20.002
So ultimately it's just being passed into this

00:03:20.492 --> 00:03:21.272
add clicks.

00:03:21.272 --> 00:03:23.472
there's a lot of videos out there on this library

00:03:23.472 --> 00:03:26.072
Zust and it is awesome for managing state across

00:03:26.072 --> 00:03:27.480
like a really big application.

00:03:28.318 --> 00:03:28.718
Now

00:03:29.318 --> 00:03:32.408
from here essentially like that's kind of like the

00:03:32.408 --> 00:03:33.248
core of what's happening.

00:03:33.248 --> 00:03:35.888
We're mostly just like connecting to a websocket

00:03:35.888 --> 00:03:37.888
and then whenever we get messages we're adding

00:03:37.888 --> 00:03:38.928
those messages to

00:03:39.448 --> 00:03:39.928
our state.

00:03:40.408 --> 00:03:42.328
Now since we're running this,

00:03:42.868 --> 00:03:44.768
since we're running our dev server

00:03:45.038 --> 00:03:46.718
or our backend service as well,

00:03:46.958 --> 00:03:48.478
this is going to be running on Port

00:03:48.728 --> 00:03:49.658
8787.

00:03:49.738 --> 00:03:51.778
So we can go ahead and we can just like paste this

00:03:51.778 --> 00:03:52.338
guy in here.

00:03:52.338 --> 00:03:54.298
For now we'll override our vite environment

00:03:54.458 --> 00:03:54.938
variable.

00:03:54.938 --> 00:03:56.618
For the time being we're just going to say

00:03:56.618 --> 00:03:58.218
localhost 8787.

00:03:59.705 --> 00:04:02.265
Now we can head back over to our client

00:04:02.265 --> 00:04:02.905
application.

00:04:02.985 --> 00:04:04.425
Looks like there was an issue here.

00:04:04.425 --> 00:04:04.825
Okay,

00:04:04.825 --> 00:04:06.281
so we'll reload this guy

00:04:06.348 --> 00:04:06.988
and then now

00:04:07.208 --> 00:04:09.328
and then what you're going to notice is you're

00:04:09.328 --> 00:04:11.688
going to see these sockets try to establish a

00:04:11.688 --> 00:04:13.128
connection and then it's just going to show as

00:04:13.128 --> 00:04:13.648
finished.

00:04:13.648 --> 00:04:13.968
And

00:04:14.368 --> 00:04:16.368
this is actually not the behavior that we're going

00:04:16.368 --> 00:04:16.688
for.

00:04:16.768 --> 00:04:20.129
the reason why is if you look at our dev server on

00:04:20.129 --> 00:04:20.609
this side,

00:04:20.609 --> 00:04:23.169
we're getting these 400 not found errors.

00:04:23.169 --> 00:04:24.489
And the reason is because

00:04:24.809 --> 00:04:26.729
we are not currently passing in

00:04:27.129 --> 00:04:29.409
a header when we're creating our socket

00:04:29.409 --> 00:04:29.849
connection.

00:04:30.169 --> 00:04:32.929
So if we head over to our app TS in our backend

00:04:32.929 --> 00:04:33.209
service,

00:04:33.859 --> 00:04:34.739
or our data service

00:04:35.059 --> 00:04:37.299
right here where we are grabbing the,

00:04:37.299 --> 00:04:37.559
the

00:04:37.559 --> 00:04:39.239
where we're grabbing the account ID

00:04:39.559 --> 00:04:40.879
from a header right now,

00:04:40.879 --> 00:04:42.599
let's just hard code it so we can

00:04:43.239 --> 00:04:44.999
see this actually make a full

00:04:45.099 --> 00:04:45.559
connection.

00:04:45.639 --> 00:04:46.839
So I'm just gonna say

00:04:50.823 --> 00:04:52.096
now when we reload this page,

00:04:52.096 --> 00:04:53.819
I suspect that this will connect.

00:04:54.202 --> 00:04:54.842
All right,

00:04:54.842 --> 00:04:57.002
so did you see that this went from not connected

00:04:57.002 --> 00:04:57.722
to connected

00:04:58.122 --> 00:04:58.682
on load.

00:04:58.842 --> 00:05:00.682
And this websocket connection,

00:05:00.682 --> 00:05:03.162
you're going to notice the time says pending.

00:05:03.642 --> 00:05:06.042
And this is basically what's happening here is

00:05:06.442 --> 00:05:08.682
it is just having this persistent connection that

00:05:08.682 --> 00:05:10.882
is maintained with the server and then you can see

00:05:10.882 --> 00:05:12.802
that we receive that and this connection has not

00:05:12.802 --> 00:05:13.482
closed yet.

00:05:14.712 --> 00:05:16.232
on our back inside of things.

00:05:16.312 --> 00:05:18.512
I do think it might be kind of cool to illustrate

00:05:18.512 --> 00:05:20.232
if we head over to our

00:05:21.442 --> 00:05:23.282
if we head over to our link tracker,

00:05:23.472 --> 00:05:24.912
this is our backend service,

00:05:24.992 --> 00:05:25.952
we can go ahead and

00:05:26.272 --> 00:05:26.672
say

00:05:27.012 --> 00:05:29.632
websocket error message or let's just say closed

00:05:29.632 --> 00:05:30.312
and we'll just say

00:05:30.632 --> 00:05:31.272
console

00:05:31.672 --> 00:05:32.072
log

00:05:33.912 --> 00:05:35.352
client closed.

00:05:35.736 --> 00:05:36.757
This guy should reload.

00:05:37.157 --> 00:05:37.797
Okay,

00:05:37.877 --> 00:05:38.757
looks like we are

00:05:39.477 --> 00:05:40.837
still connected over here.

00:05:41.077 --> 00:05:43.122
Now I'm going to go ahead and close this tab

00:05:43.155 --> 00:05:45.195
and you can see that we got this client closed

00:05:45.195 --> 00:05:45.475
event.

00:05:45.555 --> 00:05:47.155
Now we are establishing

00:05:47.815 --> 00:05:49.175
two connections

00:05:49.575 --> 00:05:51.375
during the load and that's just kind of how the

00:05:51.375 --> 00:05:52.535
dev server is behaving.

00:05:52.535 --> 00:05:53.895
When we actually deploy this

00:05:54.065 --> 00:05:54.795
we're going to,

00:05:54.795 --> 00:05:56.315
we're actually not going to have like two

00:05:56.315 --> 00:05:56.995
connections.

00:05:56.995 --> 00:05:57.395
So

00:05:57.865 --> 00:05:59.625
essentially like I think this should kind of

00:05:59.625 --> 00:06:01.625
illustrate though that we are able,

00:06:01.705 --> 00:06:02.065
oh,

00:06:02.065 --> 00:06:02.465
the reason,

00:06:02.465 --> 00:06:04.745
I guess we had two of those same windows open.

00:06:04.745 --> 00:06:05.145
But

00:06:05.590 --> 00:06:07.590
I think that this illustrates that we are able to

00:06:07.990 --> 00:06:09.270
come into our

00:06:09.730 --> 00:06:10.630
come into our

00:06:11.590 --> 00:06:14.630
user application and we have this websocket code

00:06:14.630 --> 00:06:16.430
that establishes a connection to this that is

00:06:16.430 --> 00:06:18.750
running locally and then that connection is able

00:06:18.750 --> 00:06:20.310
to actually go into our backend.

00:06:20.310 --> 00:06:22.350
So now we can actually start building out the more

00:06:22.350 --> 00:06:24.470
advanced websocket features on top of durable

00:06:24.470 --> 00:06:25.030
objects.

00:06:25.190 --> 00:06:26.790
But I do want to just

00:06:27.080 --> 00:06:29.490
revert this code because we are going to have vite

00:06:29.490 --> 00:06:30.570
and variables or

00:06:31.210 --> 00:06:34.010
environment variables that will basically pass in

00:06:34.010 --> 00:06:34.410
the

00:06:34.680 --> 00:06:36.560
that will basically pass in the host that we're

00:06:36.560 --> 00:06:37.440
going to be connecting to.

00:06:37.520 --> 00:06:38.800
And spoiler alert,

00:06:38.880 --> 00:06:41.400
we're actually not going to connect to our backend

00:06:41.400 --> 00:06:43.760
service directly from the client application.

00:06:43.760 --> 00:06:45.320
We're actually going to proxy it.

00:06:45.320 --> 00:06:47.600
So what I typically like to do as a,

00:06:47.840 --> 00:06:48.480
as a

00:06:48.650 --> 00:06:49.980
standard practice is

00:06:50.110 --> 00:06:52.683
I like to keep the user application and the

00:06:52.683 --> 00:06:54.483
operations that happen at this layer,

00:06:54.483 --> 00:06:54.763
like,

00:06:54.763 --> 00:06:57.513
very specific to the client application.

00:06:57.513 --> 00:06:59.753
So there's a separation between the data service.

00:06:59.753 --> 00:07:01.473
And the reason why is like,

00:07:01.473 --> 00:07:03.033
technically this is like two different things.

00:07:03.033 --> 00:07:05.073
You have a client that's running on the user's

00:07:05.073 --> 00:07:05.593
browser,

00:07:05.593 --> 00:07:07.353
and then you have your worker code,

00:07:07.433 --> 00:07:09.673
which right now is implementing trpc,

00:07:09.803 --> 00:07:10.993
and that's running on the server.

00:07:10.993 --> 00:07:12.193
So this is honestly,

00:07:12.193 --> 00:07:12.393
like,

00:07:12.393 --> 00:07:13.393
this is also server code.

00:07:13.393 --> 00:07:14.073
But these two,

00:07:14.073 --> 00:07:16.313
in my mind are kind of together in the sense of,

00:07:16.313 --> 00:07:16.633
like,

00:07:16.793 --> 00:07:19.193
they're very coupled in terms of the operations

00:07:19.193 --> 00:07:19.873
that are happening.

00:07:19.873 --> 00:07:20.113
So,

00:07:20.113 --> 00:07:20.393
like,

00:07:20.473 --> 00:07:22.183
CRUD operations are going this,

00:07:22.333 --> 00:07:22.818
this direction.

00:07:23.062 --> 00:07:26.062
And then also what I like to do in this scenario

00:07:26.062 --> 00:07:28.142
is we're going to establish a WebSocket

00:07:28.142 --> 00:07:28.582
connection,

00:07:29.062 --> 00:07:30.422
which is going to be two way,

00:07:30.422 --> 00:07:31.462
with this side

00:07:31.942 --> 00:07:33.542
and at this layer,

00:07:33.652 --> 00:07:34.502
on the server.

00:07:34.662 --> 00:07:36.342
Once we implement authentication,

00:07:36.662 --> 00:07:38.102
this layer right here

00:07:38.502 --> 00:07:40.782
is going to do the validation of,

00:07:40.782 --> 00:07:40.942
like,

00:07:40.942 --> 00:07:41.742
the user request.

00:07:41.742 --> 00:07:43.862
So all of the Auth logic will also be built at

00:07:43.862 --> 00:07:44.502
this layer,

00:07:45.172 --> 00:07:47.172
just to kind of like keep things really clean.

00:07:47.172 --> 00:07:48.612
And then if we need to

00:07:49.142 --> 00:07:50.862
reach out to the server for the WebSocket

00:07:50.862 --> 00:07:51.382
implementation,

00:07:51.382 --> 00:07:53.062
basically what we can do is we can

00:07:53.462 --> 00:07:53.862
then,

00:07:54.712 --> 00:07:55.912
proxy that request

00:07:56.232 --> 00:07:56.632
to

00:07:57.004 --> 00:07:57.991
our data service.

00:07:58.151 --> 00:07:59.351
And I'll show you how to do this.

00:07:59.351 --> 00:08:01.031
We'll do something called service bindings.

00:08:01.031 --> 00:08:02.671
This is a cloudflare feature where we can

00:08:02.671 --> 00:08:03.511
basically say,

00:08:03.830 --> 00:08:06.431
this service right here depends on this service,

00:08:06.431 --> 00:08:09.551
and you can proxy requests to it without it

00:08:09.551 --> 00:08:10.231
counting as,

00:08:10.231 --> 00:08:12.871
like an extra request to the service for billing

00:08:12.871 --> 00:08:13.311
purposes.

00:08:13.311 --> 00:08:14.071
So it's pretty cool.

00:08:14.281 --> 00:08:15.591
but this layer can like,

00:08:15.591 --> 00:08:16.471
authenticate the user,

00:08:16.471 --> 00:08:17.351
ensure that they should

00:08:17.641 --> 00:08:18.801
be seeing data that they are seeing,

00:08:18.801 --> 00:08:20.881
or they should be making a connection with a

00:08:20.881 --> 00:08:21.561
websocket.

00:08:21.561 --> 00:08:23.801
And then if that connection is okay,

00:08:23.881 --> 00:08:25.601
then you can go ahead and you can proxy that

00:08:25.601 --> 00:08:26.681
request to the service.

00:08:26.761 --> 00:08:27.841
So that just makes it.

00:08:27.841 --> 00:08:28.841
So we're not building like,

00:08:28.841 --> 00:08:29.161
Auth

00:08:29.481 --> 00:08:30.201
at this level,

00:08:30.281 --> 00:08:31.681
but then we're also like,

00:08:31.681 --> 00:08:32.081
you know,

00:08:32.081 --> 00:08:33.800
connecting directly to the service and we have to

00:08:33.800 --> 00:08:35.121
move the Auth into this service.

00:08:35.121 --> 00:08:36.761
And then let's say you built another service in

00:08:36.761 --> 00:08:37.161
the future.

00:08:37.161 --> 00:08:37.509
Like,

00:08:37.509 --> 00:08:38.112
you'd have to,

00:08:38.112 --> 00:08:38.272
like,

00:08:38.272 --> 00:08:39.192
build Auth into that.

00:08:39.192 --> 00:08:41.992
So I basically kind of like to make the data flow

00:08:42.662 --> 00:08:43.382
this direction.

00:08:43.462 --> 00:08:44.582
A user does something.

00:08:45.142 --> 00:08:46.702
This service is in charge of,

00:08:46.702 --> 00:08:46.902
like,

00:08:46.902 --> 00:08:47.382
ensuring,

00:08:47.712 --> 00:08:49.362
that the user is who they say they are and they

00:08:49.362 --> 00:08:50.282
can see what they can see.

00:08:50.282 --> 00:08:53.042
And if you ever need to go to the data service,

00:08:53.122 --> 00:08:55.242
you can just simply do that from the back inside

00:08:55.242 --> 00:08:55.602
of things.

00:08:55.672 --> 00:08:55.824
yeah,

00:08:55.824 --> 00:08:57.023
so that's the pattern that we're going to follow,

00:08:57.023 --> 00:08:59.104
and I'll show you how to do that later on.

00:08:59.104 --> 00:09:01.024
But now we're going to start actually building out

00:09:01.024 --> 00:09:01.384
the,

00:09:01.654 --> 00:09:04.934
the core behavior for how the websockets are going

00:09:04.934 --> 00:09:07.254
to relay the data to our client.

