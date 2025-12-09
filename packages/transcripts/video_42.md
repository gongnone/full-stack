WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.098 --> 00:00:00.658
All right,

00:00:00.898 --> 00:00:03.778
so let's get into the websocket aspect of this

00:00:03.778 --> 00:00:05.218
section of the course.

00:00:05.618 --> 00:00:07.058
Now before we get started,

00:00:07.728 --> 00:00:09.998
if you're totally new to websockets and durable

00:00:09.998 --> 00:00:10.518
objects,

00:00:10.518 --> 00:00:12.828
if you just literally Google or YouTube,

00:00:12.828 --> 00:00:13.518
durable objects,

00:00:13.518 --> 00:00:14.198
WebSockets,

00:00:14.358 --> 00:00:14.998
this video

00:00:15.318 --> 00:00:16.198
should be the,

00:00:16.278 --> 00:00:17.398
probably the first one.

00:00:17.638 --> 00:00:20.038
It's done pretty well for how niche it is and

00:00:20.438 --> 00:00:21.878
it goes into very,

00:00:21.878 --> 00:00:22.118
very,

00:00:22.118 --> 00:00:22.358
very,

00:00:22.358 --> 00:00:22.638
very,

00:00:22.638 --> 00:00:23.398
very deep

00:00:23.488 --> 00:00:25.338
detail for how the websockets work and,

00:00:25.408 --> 00:00:27.978
and you actually build out a real time Excalidraw,

00:00:28.528 --> 00:00:29.768
application on top of it.

00:00:29.768 --> 00:00:31.328
So within 40 minutes,

00:00:31.328 --> 00:00:31.968
honestly you'll,

00:00:31.968 --> 00:00:33.008
you'll take away a lot.

00:00:33.168 --> 00:00:35.008
Now we're going to cover the exact same things

00:00:35.008 --> 00:00:35.328
here,

00:00:35.598 --> 00:00:37.438
and we're going to go equally as deep.

00:00:37.438 --> 00:00:40.198
But I would say this is probably going to be like

00:00:40.198 --> 00:00:41.278
a more concise

00:00:41.568 --> 00:00:42.288
overview.

00:00:42.448 --> 00:00:44.008
So you could go watch that if you want,

00:00:44.008 --> 00:00:44.688
but you don't have to.

00:00:44.688 --> 00:00:45.088
Now,

00:00:45.758 --> 00:00:48.438
the very first thing with websockets to notice is

00:00:48.438 --> 00:00:51.038
the durable objects class has some

00:00:51.818 --> 00:00:54.258
different like helper functions that are built in.

00:00:54.258 --> 00:00:55.178
So like you have

00:00:55.498 --> 00:00:56.698
WebSocket close,

00:00:57.098 --> 00:00:57.738
you have

00:00:58.858 --> 00:01:00.218
WebSocket message

00:01:00.858 --> 00:01:01.898
and you have

00:01:02.872 --> 00:01:03.798
WebSocket error.

00:01:03.798 --> 00:01:05.398
So these are kind of events that happen

00:01:05.718 --> 00:01:06.278
typically

00:01:06.598 --> 00:01:08.478
like server side and client side.

00:01:08.478 --> 00:01:09.238
Like if a,

00:01:10.058 --> 00:01:12.378
if a websocket was to be closed on the

00:01:12.395 --> 00:01:13.294
client side of things,

00:01:13.294 --> 00:01:15.494
the server also knows that that is closed and then

00:01:15.494 --> 00:01:16.174
this will fire,

00:01:17.044 --> 00:01:19.684
if a message is sent from the client to the server

00:01:20.084 --> 00:01:22.444
this is going to trigger and then if there's an

00:01:22.444 --> 00:01:23.364
error in the websocket,

00:01:23.364 --> 00:01:24.164
this is going to trigger.

00:01:24.164 --> 00:01:24.484
Now

00:01:24.834 --> 00:01:25.054
the,

00:01:25.054 --> 00:01:27.694
the common convention for like basically being

00:01:27.694 --> 00:01:28.574
able to like,

00:01:28.734 --> 00:01:29.214
you know,

00:01:29.214 --> 00:01:31.614
manage websocket life cycle is you have a,

00:01:31.833 --> 00:01:34.360
you typically will have a client right here

00:01:35.080 --> 00:01:36.890
and you'll have a server and it

00:01:36.890 --> 00:01:39.320
will establish a two way connection

00:01:40.064 --> 00:01:41.984
and this connection stays persisted.

00:01:41.984 --> 00:01:43.264
So basically it does not close.

00:01:43.344 --> 00:01:43.904
And then

00:01:44.224 --> 00:01:45.504
you can have multiple clients.

00:01:45.504 --> 00:01:46.785
So these are clients over here.

00:01:46.986 --> 00:01:49.146
We'll just call this three clients for now.

00:01:49.157 --> 00:01:51.416
And each one of these three clients is going to

00:01:51.416 --> 00:01:51.976
have a

00:01:52.206 --> 00:01:53.896
is going to have a persistent connection.

00:01:55.016 --> 00:01:55.416
Now,

00:01:59.570 --> 00:02:01.970
now if this client sends a message over

00:02:02.450 --> 00:02:03.650
to the server,

00:02:03.890 --> 00:02:06.250
the server can read the message and determine what

00:02:06.250 --> 00:02:08.770
to do and typically it's going to like respond

00:02:09.010 --> 00:02:11.332
with another message back to the client.

00:02:11.332 --> 00:02:14.150
Now the server also keeps track of all the clients

00:02:14.150 --> 00:02:15.910
that are connected at a given point in time.

00:02:15.990 --> 00:02:18.790
So you could have a flow where you basically one

00:02:18.790 --> 00:02:20.390
client sends something over here

00:02:20.870 --> 00:02:21.710
and then the server says,

00:02:21.710 --> 00:02:21.990
okay,

00:02:21.990 --> 00:02:24.510
I want to relay that message to this one and this

00:02:24.510 --> 00:02:25.350
one at the same time.

00:02:25.430 --> 00:02:27.510
So this guy sends something and then this,

00:02:27.590 --> 00:02:28.710
the server pushes,

00:02:29.300 --> 00:02:31.580
the data back to these clients over here.

00:02:32.140 --> 00:02:33.900
So if you were to just basically have like some

00:02:33.900 --> 00:02:35.180
type of relay service,

00:02:35.260 --> 00:02:37.700
like the client sends data and then it sends it

00:02:37.700 --> 00:02:37.980
back,

00:02:38.220 --> 00:02:40.100
essentially the implementation would look like you

00:02:40.100 --> 00:02:40.380
would say,

00:02:40.380 --> 00:02:41.020
await

00:02:41.740 --> 00:02:46.180
websocket.send and you would send whatever message

00:02:46.180 --> 00:02:46.540
you want.

00:02:46.540 --> 00:02:46.740
So,

00:02:46.740 --> 00:02:46.900
like,

00:02:46.900 --> 00:02:48.300
we could just basically pass in,

00:02:48.880 --> 00:02:49.040
or,

00:02:49.040 --> 00:02:49.400
sorry,

00:02:49.400 --> 00:02:50.480
this is the wrong method.

00:02:50.640 --> 00:02:53.280
So this is on websocket message and you could pass

00:02:53.280 --> 00:02:55.840
in the message that was received.

00:02:56.160 --> 00:02:56.560
So

00:02:56.960 --> 00:02:58.480
essentially what would happen here,

00:02:58.480 --> 00:03:00.800
it looks like it wants an array or a string buffer

00:03:00.880 --> 00:03:02.560
and this one wants message.

00:03:02.560 --> 00:03:03.846
So basically it's going to say

00:03:03.846 --> 00:03:05.156
Just make sure that's async.

00:03:05.156 --> 00:03:05.596
Okay,

00:03:05.676 --> 00:03:05.954
so

00:03:05.954 --> 00:03:07.758
essentially what would happen here is when the

00:03:07.758 --> 00:03:09.838
client connects to the server and the client sends

00:03:09.838 --> 00:03:10.238
a message,

00:03:10.238 --> 00:03:12.158
that exact same message would be sent back to the

00:03:12.158 --> 00:03:12.508
client.

00:03:12.818 --> 00:03:13.058
Now,

00:03:13.218 --> 00:03:14.658
you could also access

00:03:15.218 --> 00:03:15.618
from

00:03:15.938 --> 00:03:17.938
the durable object context,

00:03:22.074 --> 00:03:23.615
you can get websockets.

00:03:24.335 --> 00:03:26.495
Now what this would do is essentially

00:03:31.305 --> 00:03:31.432
is,

00:03:31.432 --> 00:03:34.272
essentially this is an array of all of the

00:03:34.272 --> 00:03:35.952
websockets that are currently connected.

00:03:35.952 --> 00:03:37.752
So you could just loop through websockets.

00:03:38.372 --> 00:03:39.732
Then for each websocket,

00:03:49.762 --> 00:03:52.216
so for each of these specific websockets,

00:03:52.216 --> 00:03:52.656
you could,

00:03:52.656 --> 00:03:53.216
you know,

00:03:53.216 --> 00:03:53.576
say,

00:03:53.736 --> 00:03:54.456
await

00:03:55.976 --> 00:03:56.536
connection,

00:03:56.776 --> 00:03:57.176
send,

00:03:57.176 --> 00:03:58.896
and then you could send whatever message you

00:03:58.896 --> 00:03:59.496
wanted to send.

00:03:59.496 --> 00:04:01.656
So this would broadcast data to all of the

00:04:01.656 --> 00:04:02.016
clients.

00:04:02.096 --> 00:04:02.376
Now,

00:04:02.376 --> 00:04:03.416
you could also Compare,

00:04:03.416 --> 00:04:03.776
like

00:04:04.256 --> 00:04:06.576
this ID WS.

00:04:07.942 --> 00:04:08.642
You could technically,

00:04:08.642 --> 00:04:09.482
like compare

00:04:09.802 --> 00:04:11.082
this connection with

00:04:11.379 --> 00:04:13.219
the websocket that

00:04:13.699 --> 00:04:14.859
comes in on the message.

00:04:14.859 --> 00:04:16.019
And this is how you would know,

00:04:16.019 --> 00:04:16.259
like,

00:04:16.259 --> 00:04:16.579
if

00:04:16.979 --> 00:04:17.859
this connection

00:04:18.259 --> 00:04:18.819
equals

00:04:19.569 --> 00:04:20.649
this websocket,

00:04:20.649 --> 00:04:21.129
you know,

00:04:21.129 --> 00:04:22.929
like the person that sent the message

00:04:23.489 --> 00:04:25.849
is part of this connection that's being iterated

00:04:25.849 --> 00:04:26.009
through,

00:04:26.009 --> 00:04:26.409
then you could,

00:04:26.409 --> 00:04:26.569
like,

00:04:26.569 --> 00:04:27.529
maybe not send them data.

00:04:27.529 --> 00:04:28.329
So this is really just.

00:04:28.329 --> 00:04:29.689
I know this is probably a little bit confusing,

00:04:29.689 --> 00:04:31.289
but just kind of think about it,

00:04:31.289 --> 00:04:31.489
like,

00:04:31.489 --> 00:04:31.809
you,

00:04:31.979 --> 00:04:32.989
get a message here,

00:04:32.989 --> 00:04:35.549
and then you also get a specific websocket that

00:04:35.549 --> 00:04:36.069
sent it.

00:04:36.149 --> 00:04:38.469
But you could also call this method to get all of

00:04:38.469 --> 00:04:39.229
the connections.

00:04:39.229 --> 00:04:40.589
So all of the websockets that are currently

00:04:40.589 --> 00:04:42.269
connected or all the clients that are currently

00:04:42.269 --> 00:04:43.469
connected to your server.

00:04:43.469 --> 00:04:45.869
So that is like one basic thing of the API.

00:04:45.869 --> 00:04:48.429
And then these things fire whenever these events

00:04:48.429 --> 00:04:48.709
happen.

00:04:48.789 --> 00:04:49.869
So whenever an error happens,

00:04:49.869 --> 00:04:50.469
a Message happens,

00:04:50.469 --> 00:04:51.809
or WebSocket closes.

00:04:52.209 --> 00:04:52.609
Now,

00:04:52.929 --> 00:04:54.449
we're not going to worry too much about those

00:04:54.449 --> 00:04:54.889
right now.

00:04:54.889 --> 00:04:56.449
What we're going to do is we're going to come into

00:04:56.449 --> 00:04:58.609
our fetch handler and we're going to replace some

00:04:58.609 --> 00:04:59.329
of this stuff.

00:04:59.409 --> 00:04:59.809
So

00:05:00.749 --> 00:05:04.309
in order to like configure your durable object to

00:05:04.309 --> 00:05:05.389
actually be able to

00:05:05.679 --> 00:05:07.749
to actually be able to utilize WebSockets,

00:05:07.829 --> 00:05:10.109
there's kind of common convention the durable

00:05:10.109 --> 00:05:12.749
objects documentation has like this exact pattern.

00:05:12.749 --> 00:05:15.349
But you essentially create a websocket pair from

00:05:15.349 --> 00:05:15.659
this

00:05:16.529 --> 00:05:18.689
from this standard library websocket pair

00:05:19.089 --> 00:05:19.489
and

00:05:20.049 --> 00:05:22.449
then you're going to grab the value.

00:05:22.529 --> 00:05:24.449
So this is ultimately just an object

00:05:25.009 --> 00:05:25.569
index

00:05:25.889 --> 00:05:26.689
0 and 1.

00:05:26.689 --> 00:05:29.009
So you're grabbing WebSocket WebSocket

00:05:29.329 --> 00:05:29.729
and

00:05:30.129 --> 00:05:30.609
the first,

00:05:30.609 --> 00:05:30.929
the,

00:05:30.929 --> 00:05:34.529
the 0 index represents client and the second one

00:05:34.529 --> 00:05:36.369
or the first represents server.

00:05:36.529 --> 00:05:36.929
Now

00:05:38.069 --> 00:05:41.469
the durable object itself has the context and

00:05:41.469 --> 00:05:43.669
there's a method called Accept websocket.

00:05:43.749 --> 00:05:45.629
And when you pass the server into Accept

00:05:45.629 --> 00:05:46.389
websocket,

00:05:46.389 --> 00:05:49.249
this websocket connection is now going to be

00:05:49.249 --> 00:05:50.129
accepted by

00:05:50.619 --> 00:05:52.379
is now going to be accepted by the

00:05:53.069 --> 00:05:54.029
durable object.

00:05:54.029 --> 00:05:57.509
And it knows that this is the exact instance of

00:05:57.509 --> 00:05:59.309
the server that I should keep track of.

00:05:59.709 --> 00:06:01.909
Then from there what you're going to want to do is

00:06:01.909 --> 00:06:02.909
you're going to want to return

00:06:04.349 --> 00:06:05.709
a new response

00:06:06.909 --> 00:06:09.149
and that new response is not going to have any

00:06:09.149 --> 00:06:10.349
data that is returned.

00:06:10.669 --> 00:06:11.069
But

00:06:11.389 --> 00:06:11.949
in these

00:06:12.099 --> 00:06:14.939
in the actual like status and the type,

00:06:14.939 --> 00:06:16.379
what you're going to do is you're going to say the

00:06:16.379 --> 00:06:19.059
status is of the type 101 which is a

00:06:19.379 --> 00:06:20.329
WebSocket

00:06:20.329 --> 00:06:22.639
status which basically means connection must stay

00:06:22.639 --> 00:06:22.919
open,

00:06:22.919 --> 00:06:26.319
client should not close that status or close that

00:06:26.319 --> 00:06:26.759
connection.

00:06:26.999 --> 00:06:29.119
And then you're going to pass in WebSocket and

00:06:29.119 --> 00:06:30.279
then you'll pass the client.

00:06:30.679 --> 00:06:32.439
And what this does is this basically

00:06:32.729 --> 00:06:35.099
establishes a two way connection between a client

00:06:35.259 --> 00:06:36.308
and a server.

00:06:36.578 --> 00:06:36.818
Then

00:06:37.302 --> 00:06:39.679
from your like actual entry point.

00:06:39.759 --> 00:06:41.439
So we have this dummy thing right here.

00:06:41.919 --> 00:06:44.079
This now instead of taking a

00:06:44.479 --> 00:06:47.879
like a traditional get request is actually going

00:06:47.879 --> 00:06:48.239
to

00:06:48.539 --> 00:06:49.538
be able to proxy

00:06:49.803 --> 00:06:50.203
the

00:06:50.223 --> 00:06:51.443
to be able to proxy the

00:06:51.763 --> 00:06:55.083
web socket request and then there's going to be a

00:06:55.083 --> 00:06:57.203
two way persist persistent connection that is

00:06:57.203 --> 00:06:57.358
made.

00:06:57.510 --> 00:06:59.430
Now in order to actually ensure that this is

00:06:59.430 --> 00:07:01.390
indeed a websocket connection there's some

00:07:01.390 --> 00:07:02.900
additional things that you'll have to do.

00:07:02.900 --> 00:07:04.310
usually you'll do these manually.

00:07:04.310 --> 00:07:07.230
Like the example would be you need to check

00:07:07.300 --> 00:07:09.090
you need to like check the upgraded header

00:07:09.570 --> 00:07:11.330
and make sure that,

00:07:11.395 --> 00:07:12.828
and you have to make sure that the,

00:07:12.988 --> 00:07:15.468
that the header is indeed upgraded or

00:07:15.788 --> 00:07:18.428
if ensure that it is indeed a

00:07:18.598 --> 00:07:20.718
websocket connection from the header of the

00:07:20.718 --> 00:07:21.158
request

00:07:21.478 --> 00:07:23.558
and then from there this code should actually

00:07:24.208 --> 00:07:24.928
maintain a

00:07:24.988 --> 00:07:25.768
Steady connection,

00:07:25.928 --> 00:07:26.928
client to server.

00:07:26.928 --> 00:07:27.288
Now,

00:07:27.288 --> 00:07:29.528
what we're going to do for the purpose of this,

00:07:30.038 --> 00:07:31.158
for the purpose of this,

00:07:31.738 --> 00:07:32.458
example,

00:07:32.698 --> 00:07:35.498
what I'm going to do is I'm going to rename the

00:07:37.108 --> 00:07:38.388
path to Client

00:07:38.868 --> 00:07:41.828
socket and then I'm just going to take an account

00:07:41.828 --> 00:07:44.508
ID and we're basically just going to like do some

00:07:44.508 --> 00:07:46.228
dummy data for the account ID for now.

00:07:46.308 --> 00:07:48.468
We'll add this later to actually ensure that it

00:07:48.788 --> 00:07:49.908
is working as expected.

00:07:49.988 --> 00:07:50.388
But,

00:07:51.088 --> 00:07:52.608
I think later what we're going to be able to do is

00:07:52.608 --> 00:07:55.088
we'll be able to extract this from the

00:07:56.506 --> 00:07:57.041
You know what,

00:07:57.041 --> 00:07:59.121
I actually do think this is probably the better

00:07:59.121 --> 00:07:59.761
route for now.

00:07:59.761 --> 00:08:02.361
So we'll just basically say client socket

00:08:02.761 --> 00:08:05.241
and we will pass in an account

00:08:05.561 --> 00:08:06.441
ID here.

00:08:06.761 --> 00:08:07.182
All right.

00:08:07.564 --> 00:08:08.604
So I'm actually,

00:08:08.844 --> 00:08:11.884
instead of pulling the account as a parameter,

00:08:12.284 --> 00:08:13.244
I'm going to

00:08:13.804 --> 00:08:16.064
have it just say click socket is the

00:08:16.064 --> 00:08:18.224
path and then I'm going to extract it from the

00:08:18.224 --> 00:08:18.584
headers.

00:08:18.584 --> 00:08:20.744
And the reason why I'm doing this now is because

00:08:21.064 --> 00:08:23.304
in the future you might want to extend,

00:08:23.504 --> 00:08:23.984
some like,

00:08:23.984 --> 00:08:26.304
custom authentication at this level as well,

00:08:26.384 --> 00:08:28.064
and that would probably come from the header.

00:08:28.064 --> 00:08:29.664
So we're going to be grabbing that from the

00:08:29.664 --> 00:08:31.144
headers and then we're going to be proxying it

00:08:31.144 --> 00:08:31.424
through.

00:08:31.424 --> 00:08:34.064
So I think this is enough for the boilerplate of

00:08:34.064 --> 00:08:34.704
the setup.

00:08:34.824 --> 00:08:36.414
just to kind of recap what we have here,

00:08:36.894 --> 00:08:38.614
I would just make sure you get all the code ready

00:08:38.614 --> 00:08:39.454
for the next section,

00:08:39.454 --> 00:08:41.014
because essentially what we're going to do is

00:08:41.014 --> 00:08:42.814
we're going to integrate this into our ui,

00:08:43.254 --> 00:08:45.214
just to make sure that we're able to establish a

00:08:45.214 --> 00:08:46.214
connection with our,

00:08:46.864 --> 00:08:48.264
with our durable object,

00:08:48.264 --> 00:08:49.665
and then we'll kind of go from there.

