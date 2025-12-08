WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.124 --> 00:00:00.604
All right,

00:00:00.684 --> 00:00:02.644
so now that we have our account set up,

00:00:02.644 --> 00:00:05.244
let's go through the process of creating a queue

00:00:05.244 --> 00:00:07.324
and binding it to our application and then we'll

00:00:07.324 --> 00:00:09.244
kind of like talk through the development process

00:00:09.244 --> 00:00:10.524
for working with queues.

00:00:10.684 --> 00:00:12.604
So first thing that we're going to do is head over

00:00:12.604 --> 00:00:13.684
to storage and databases,

00:00:13.684 --> 00:00:14.604
go to queues,

00:00:14.604 --> 00:00:16.124
and then we can go to create.

00:00:16.204 --> 00:00:16.564
Now,

00:00:16.564 --> 00:00:17.444
like I've said before,

00:00:17.444 --> 00:00:19.644
you can do this from the Wrangler CLI if you want,

00:00:19.644 --> 00:00:21.404
but we're going to be using the

00:00:21.614 --> 00:00:23.484
UI for the purpose of this course.

00:00:23.644 --> 00:00:25.684
So what we're going to do is we're going to call

00:00:25.684 --> 00:00:26.044
this

00:00:26.844 --> 00:00:27.404
Smart

00:00:28.224 --> 00:00:28.944
Links,

00:00:30.214 --> 00:00:31.204
data queue

00:00:31.844 --> 00:00:35.204
and then I'm going to have stage appended to the

00:00:35.204 --> 00:00:37.564
end because this is essentially the lower

00:00:37.564 --> 00:00:39.844
environment version of the application and we'll

00:00:39.844 --> 00:00:41.884
get to actually how we segment and build out the

00:00:41.884 --> 00:00:42.964
production version later.

00:00:43.124 --> 00:00:44.884
So let's go ahead and create that.

00:00:44.976 --> 00:00:45.318
All right,

00:00:45.318 --> 00:00:46.918
so from here you can see that we have these

00:00:46.918 --> 00:00:47.318
queues.

00:00:47.398 --> 00:00:49.718
We can click on that guy and we can grab some

00:00:49.718 --> 00:00:50.678
useful information here.

00:00:50.678 --> 00:00:51.878
So this is the queue name,

00:00:51.878 --> 00:00:53.158
this is the qid

00:00:53.638 --> 00:00:56.038
and it's currently in the state of inactive.

00:00:56.518 --> 00:00:58.118
So if we head back to our application

00:00:58.518 --> 00:01:00.278
and we go to our data service,

00:01:00.838 --> 00:01:03.638
we can head over to our Wrangler JSON file.

00:01:03.718 --> 00:01:05.878
What we're going to do is we are going to be

00:01:05.878 --> 00:01:07.238
adding an actual

00:01:07.448 --> 00:01:08.578
queues section

00:01:08.898 --> 00:01:10.178
to this configuration

00:01:10.578 --> 00:01:11.697
so we can say queues.

00:01:11.697 --> 00:01:13.258
And what this does is from my end,

00:01:13.258 --> 00:01:15.178
it automatically auto completes consumers and

00:01:15.178 --> 00:01:15.858
producers.

00:01:16.018 --> 00:01:18.858
We're going to first start by adding a consumer

00:01:18.858 --> 00:01:19.138
here.

00:01:19.218 --> 00:01:21.578
So we need to go ahead and delete the producers

00:01:21.578 --> 00:01:22.818
for now as we don't need it.

00:01:22.978 --> 00:01:23.228
And.

00:01:23.378 --> 00:01:25.538
And inside of here you can actually add more than

00:01:25.538 --> 00:01:27.618
one consumer to give an application.

00:01:27.618 --> 00:01:29.898
And we'll kind of like talk about how that would

00:01:29.898 --> 00:01:30.978
look in just a minute.

00:01:31.378 --> 00:01:33.378
But let's just start by saying,

00:01:33.678 --> 00:01:34.764
we're going to give it a queue

00:01:34.764 --> 00:01:36.370
and then we're going to be passing in the queue

00:01:36.370 --> 00:01:36.690
name

00:01:37.010 --> 00:01:37.890
from here

00:01:39.350 --> 00:01:41.470
And after we have a queue name we can head back

00:01:41.470 --> 00:01:42.430
over to our code.

00:01:42.430 --> 00:01:44.070
Now there are a lot of different

00:01:44.390 --> 00:01:46.230
configurations that you can put inside this

00:01:46.230 --> 00:01:47.150
consumer block,

00:01:47.150 --> 00:01:48.590
which we will go into later.

00:01:48.590 --> 00:01:49.230
But for now,

00:01:49.230 --> 00:01:49.870
bare minimum,

00:01:49.870 --> 00:01:52.510
all you need is the queue name in your application

00:01:52.510 --> 00:01:54.910
will know that it should act as a consumer.

00:01:54.910 --> 00:01:56.390
Now in order for this code to work

00:01:56.710 --> 00:01:58.950
we also need to make sure we implement the queue

00:01:58.950 --> 00:01:59.430
handler

00:01:59.750 --> 00:02:01.830
inside of our worker entry point.

00:02:01.990 --> 00:02:03.270
So head back to index.

00:02:03.590 --> 00:02:05.190
Now depending on your ide

00:02:05.590 --> 00:02:07.190
you should be able to just say queue

00:02:07.650 --> 00:02:08.850
and it should autocomplete.

00:02:08.850 --> 00:02:11.010
And essentially what it's doing is it's saying a

00:02:11.010 --> 00:02:14.450
queue method is going to receive a batch of events

00:02:14.530 --> 00:02:17.250
and those events will have messages and each of

00:02:17.250 --> 00:02:19.370
the message contains some data that you want to

00:02:19.370 --> 00:02:19.650
process.

00:02:19.970 --> 00:02:22.410
So what I like to do is I like to ensure that this

00:02:22.410 --> 00:02:24.930
function is async from the beginning.

00:02:25.570 --> 00:02:28.610
And then I basically say here's a batch

00:02:29.220 --> 00:02:29.620
of

00:02:30.180 --> 00:02:30.740
message,

00:02:30.740 --> 00:02:31.140
batch.

00:02:31.300 --> 00:02:32.900
The type is unknown for now.

00:02:33.320 --> 00:02:34.920
And what we're doing is we are saying,

00:02:34.920 --> 00:02:35.320
okay,

00:02:35.320 --> 00:02:37.000
for every single message

00:02:37.400 --> 00:02:38.520
inside of a,

00:02:39.040 --> 00:02:39.980
a batch of messages,

00:02:40.300 --> 00:02:43.260
let's just Simply log out message.body.

00:02:43.260 --> 00:02:45.340
so the body contains the actual information

00:02:45.980 --> 00:02:47.820
or the actual data for a

00:02:48.340 --> 00:02:49.620
given queue event.

00:02:50.180 --> 00:02:51.380
And additionally

00:02:51.780 --> 00:02:54.180
a message has some other information.

00:02:54.340 --> 00:02:56.500
Like you have an ack to basically mean

00:02:56.820 --> 00:02:58.060
acknowledge the message,

00:02:58.060 --> 00:03:00.580
which tells the the queue that you've processed

00:03:00.580 --> 00:03:00.740
it.

00:03:00.740 --> 00:03:01.860
You don't have to call ack,

00:03:01.860 --> 00:03:03.940
but you can manually call ACK if you want to say

00:03:03.940 --> 00:03:05.220
I've processed this message,

00:03:05.220 --> 00:03:06.740
I don't want to process it anymore.

00:03:07.340 --> 00:03:09.820
this will also give you a number of attempts that

00:03:09.820 --> 00:03:12.140
the queue has tried for a given message,

00:03:12.140 --> 00:03:12.660
for the,

00:03:12.660 --> 00:03:14.460
for the number of attempts that like a queue has

00:03:14.460 --> 00:03:14.780
actually

00:03:15.100 --> 00:03:17.260
attempted to process and then failed.

00:03:17.350 --> 00:03:18.640
so this will start out zero

00:03:19.040 --> 00:03:19.520
bodies.

00:03:19.520 --> 00:03:20.320
Obviously the data,

00:03:20.510 --> 00:03:22.200
every single queue event has a given

00:03:22.520 --> 00:03:22.920
ID

00:03:23.640 --> 00:03:24.040
and

00:03:24.230 --> 00:03:25.240
you have a retry

00:03:25.430 --> 00:03:27.770
method and then you have a timestamp associated

00:03:27.770 --> 00:03:28.290
with it.

00:03:28.450 --> 00:03:31.170
So for now all we're going to be doing is we're

00:03:31.170 --> 00:03:33.570
going to be logging the message body.

00:03:33.960 --> 00:03:36.680
now what we can do is we can say pnpm run,

00:03:36.760 --> 00:03:37.400
deploy,

00:03:37.960 --> 00:03:40.880
make sure you are in the data services directory

00:03:40.880 --> 00:03:41.560
when you do this.

00:03:41.644 --> 00:03:43.404
Now when this is done deploying,

00:03:43.404 --> 00:03:44.964
what you're going to notice is you're going to

00:03:44.964 --> 00:03:47.844
have a consumer for smart links data queue.

00:03:47.844 --> 00:03:51.484
So basically this knows that a dependency for the

00:03:51.884 --> 00:03:54.514
data service is now the queue that we have

00:03:54.514 --> 00:03:56.114
configured as the consumer.

00:03:56.574 --> 00:03:58.334
And then for the deployment to be successful you

00:03:58.334 --> 00:04:00.414
have to make sure you build out a queue handler

00:04:00.414 --> 00:04:01.534
and for now we are just

00:04:01.854 --> 00:04:02.734
logging the body.

00:04:02.814 --> 00:04:05.254
Eventually we're going to be passing in the data

00:04:05.254 --> 00:04:08.334
to an actual handler that processes a given event.

00:04:09.134 --> 00:04:11.294
So we can head back over to our Cloudflare account

00:04:11.614 --> 00:04:13.374
and you can come over to

00:04:13.874 --> 00:04:15.234
the workers and pages.

00:04:15.371 --> 00:04:15.771
And

00:04:16.531 --> 00:04:18.491
from here what we're going to do is I'm actually

00:04:18.491 --> 00:04:21.411
going to open the logs in a new tab.

00:04:21.921 --> 00:04:22.161
So

00:04:22.481 --> 00:04:24.241
we have our logs here

00:04:24.561 --> 00:04:27.281
for this specific data service application.

00:04:27.521 --> 00:04:30.321
And this is just like one way of validating your

00:04:30.401 --> 00:04:31.161
key was working.

00:04:31.161 --> 00:04:32.561
You could also do this locally.

00:04:32.611 --> 00:04:34.801
I typically like to test back in projects,

00:04:35.651 --> 00:04:38.531
in a kind of more like production way.

00:04:38.531 --> 00:04:40.371
So what I like to do is I like to say,

00:04:40.801 --> 00:04:44.271
to build out modular components that I can test in

00:04:44.271 --> 00:04:47.791
isolation with unit tests and then to actual test

00:04:47.791 --> 00:04:49.431
like end to end integrations,

00:04:49.621 --> 00:04:50.441
by deploying.

00:04:50.601 --> 00:04:52.521
So for now we're just gonna

00:04:52.901 --> 00:04:54.501
making sure visually that this is working.

00:04:54.661 --> 00:04:56.261
Because if it's your first time working with

00:04:56.261 --> 00:04:56.661
queues,

00:04:56.661 --> 00:04:58.421
there might be a lot of questions that you have.

00:04:58.821 --> 00:05:02.021
So let's head over to our storage databases queues

00:05:02.181 --> 00:05:02.851
and remember,

00:05:02.851 --> 00:05:03.271
we have the

00:05:03.271 --> 00:05:06.551
logs open in a new tab and I just turn the real

00:05:06.551 --> 00:05:07.431
time logs on.

00:05:07.911 --> 00:05:09.991
So what we're going to notice now is the status

00:05:09.991 --> 00:05:12.351
for a queue is now active because it now has a

00:05:12.351 --> 00:05:13.911
consumer for that queue.

00:05:14.151 --> 00:05:17.271
Something to note is a queue can only have one

00:05:17.271 --> 00:05:17.991
consumer,

00:05:17.991 --> 00:05:20.311
so you can't have multiple applications

00:05:20.941 --> 00:05:22.021
consuming from the same queue.

00:05:22.021 --> 00:05:24.101
I think Cloudflare eventually wants to build out

00:05:24.101 --> 00:05:24.741
that capability,

00:05:24.741 --> 00:05:27.341
but for now you can only have one consumer.

00:05:27.741 --> 00:05:29.221
Let's head over to Messages now.

00:05:29.221 --> 00:05:30.541
There's a bunch of things here that we're going to

00:05:30.541 --> 00:05:31.301
be going through later,

00:05:31.301 --> 00:05:33.141
but for now we're just going to go to send

00:05:33.141 --> 00:05:33.559
messages

00:05:33.679 --> 00:05:34.119
All right,

00:05:34.119 --> 00:05:37.079
so let's go ahead and just send hello World as a

00:05:37.079 --> 00:05:37.999
text message.

00:05:38.149 --> 00:05:40.059
the body is going to show up as hello World.

00:05:40.779 --> 00:05:43.739
And if the real time logs are not being finicky

00:05:43.739 --> 00:05:44.859
within a few seconds,

00:05:44.859 --> 00:05:45.819
we should see

00:05:46.219 --> 00:05:47.539
the logs pop up here.

00:05:47.539 --> 00:05:48.539
So you can see that,

00:05:49.029 --> 00:05:51.469
we got one log that is basically the event,

00:05:51.469 --> 00:05:53.909
the Q event that gets logged automatically by the

00:05:53.909 --> 00:05:54.189
system.

00:05:54.349 --> 00:05:56.709
And then we have our additional actual console log

00:05:56.709 --> 00:05:57.929
here where we said queue,

00:05:57.999 --> 00:05:58.159
queue,

00:05:58.159 --> 00:05:58.399
event,

00:05:59.119 --> 00:05:59.859
hello World.

00:06:00.099 --> 00:06:00.499
So

00:06:00.819 --> 00:06:02.979
let's just see if that will pop up one more time.

00:06:03.139 --> 00:06:04.459
And just to note,

00:06:04.459 --> 00:06:06.059
sometimes these real time logs can be a bit

00:06:06.059 --> 00:06:06.639
finicky.

00:06:06.739 --> 00:06:08.859
so I wouldn't stress too much if you're not seeing

00:06:08.859 --> 00:06:10.339
these logs pop up for you,

00:06:10.899 --> 00:06:11.299
but,

00:06:11.629 --> 00:06:13.869
this is one way of just kind of validating that

00:06:13.869 --> 00:06:15.309
things are working as expected.

00:06:15.949 --> 00:06:17.789
So we should see them pop up.

00:06:17.789 --> 00:06:20.269
And there's usually a delay of just a few seconds.

00:06:20.509 --> 00:06:22.949
And we can kind of configure how long that delay

00:06:22.949 --> 00:06:23.229
is

00:06:23.489 --> 00:06:23.778
as well.

00:06:23.778 --> 00:06:24.112
But

00:06:24.592 --> 00:06:26.832
let's just send a few more events here.

00:06:27.545 --> 00:06:28.105
All right,

00:06:28.105 --> 00:06:29.605
so you can see that we had these,

00:06:29.605 --> 00:06:31.145
hello World messages come up.

00:06:31.145 --> 00:06:31.985
And if you notice,

00:06:31.985 --> 00:06:34.705
we have our one system log here and then we have

00:06:34.705 --> 00:06:35.105
hello World.

00:06:35.105 --> 00:06:35.545
Hello World.

00:06:35.545 --> 00:06:36.065
Hello World.

00:06:36.065 --> 00:06:36.425
So

00:06:37.145 --> 00:06:39.305
what this is actually noting is this is a

00:06:39.625 --> 00:06:42.025
log that's generated by the system when the

00:06:42.025 --> 00:06:43.385
trigger happens for the first time,

00:06:43.385 --> 00:06:46.425
when that we get a batch of messages and then this

00:06:46.425 --> 00:06:49.545
specific batch processed those three messages

00:06:50.025 --> 00:06:50.985
in one event.

00:06:51.145 --> 00:06:52.745
So essentially there was a batch of three,

00:06:52.905 --> 00:06:54.785
and then it looped through and logged each one

00:06:54.785 --> 00:06:55.265
individually.

00:06:55.265 --> 00:06:56.025
So that's a great,

00:06:56.465 --> 00:06:58.305
that's a great visualization of how

00:06:58.785 --> 00:06:59.185
this,

00:07:00.065 --> 00:07:02.305
this batch of messages is an array of messages,

00:07:02.305 --> 00:07:04.813
and then we process them individually one by one.

00:07:04.964 --> 00:07:07.324
Another feature that we have here in the UI is

00:07:07.324 --> 00:07:10.604
actually the ability to pause the delivery of

00:07:10.604 --> 00:07:11.444
these events.

00:07:11.684 --> 00:07:13.124
So if we come over here,

00:07:13.124 --> 00:07:15.364
we can change the status to pause.

00:07:16.164 --> 00:07:18.244
And what's going to happen here is if we send a

00:07:18.244 --> 00:07:19.231
bunch of these events,

00:07:19.231 --> 00:07:21.401
they're actually not going to be processed by the

00:07:21.401 --> 00:07:21.921
consumer.

00:07:21.921 --> 00:07:23.441
They're going to be stuck in this queue.

00:07:23.681 --> 00:07:26.641
And you can set at the Wrangler configuration

00:07:26.641 --> 00:07:26.961
level,

00:07:27.511 --> 00:07:30.151
how long you want data to actually be stored in

00:07:30.151 --> 00:07:31.671
the queue until it expires.

00:07:32.071 --> 00:07:32.991
And from here,

00:07:32.991 --> 00:07:33.671
if we hit list,

00:07:33.671 --> 00:07:35.991
you can see we actually have these messages here

00:07:36.151 --> 00:07:37.631
and we can add a few more.

00:07:37.631 --> 00:07:38.151
Boom,

00:07:38.151 --> 00:07:38.631
boom,

00:07:38.631 --> 00:07:39.111
boom.

00:07:39.158 --> 00:07:40.261
Let's list that one more time.

00:07:40.261 --> 00:07:41.701
You can see that we get these messages.

00:07:42.021 --> 00:07:43.961
we should be able to actually like inspect it.

00:07:43.961 --> 00:07:45.321
If this was like a JSON object,

00:07:45.321 --> 00:07:47.281
you'd be able to see more information about the

00:07:47.281 --> 00:07:48.321
contents of that queue.

00:07:48.321 --> 00:07:48.521
Now,

00:07:48.521 --> 00:07:50.161
I don't use this UI to like,

00:07:50.321 --> 00:07:51.161
do very much.

00:07:51.161 --> 00:07:52.481
I just kind of want to illustrate

00:07:52.921 --> 00:07:53.401
that currently

00:07:53.961 --> 00:07:56.081
these messages are in the queue,

00:07:56.081 --> 00:07:58.801
they're not being processed because we have paused

00:07:58.801 --> 00:08:00.281
the status and I actually,

00:08:00.281 --> 00:08:02.281
we're going to be using the pause delivery status

00:08:02.281 --> 00:08:04.121
for our dead letter queue later on.

00:08:04.441 --> 00:08:06.361
Let's go ahead and hit resume.

00:08:06.521 --> 00:08:07.721
When you hit resume,

00:08:07.801 --> 00:08:09.793
they're going to be processed over here.

00:08:09.793 --> 00:08:10.365
And then,

00:08:11.545 --> 00:08:13.145
once the consumer is done processing them,

00:08:13.145 --> 00:08:13.865
when we hit list,

00:08:13.865 --> 00:08:16.145
you can see that there are no more messages in the

00:08:16.145 --> 00:08:17.905
queue because they have all been processed.

00:08:17.985 --> 00:08:19.785
So that's just kind of like one thing to note

00:08:19.785 --> 00:08:19.985
here.

00:08:19.985 --> 00:08:22.265
You do have the ability to pause all messages from

00:08:22.265 --> 00:08:22.545
being.

00:08:23.165 --> 00:08:23.365
So if,

00:08:23.365 --> 00:08:23.525
like,

00:08:23.525 --> 00:08:25.565
there's any reason why you need to have a kill

00:08:25.565 --> 00:08:26.605
switch in your application,

00:08:26.605 --> 00:08:26.805
like,

00:08:26.805 --> 00:08:27.365
to basically say,

00:08:27.365 --> 00:08:27.725
hey,

00:08:27.805 --> 00:08:28.925
I don't want to process

00:08:29.245 --> 00:08:30.405
anything else right now,

00:08:30.405 --> 00:08:31.105
I want to wait,

00:08:31.355 --> 00:08:31.955
until like,

00:08:31.955 --> 00:08:33.835
I fix a bug or something is resolved.

00:08:33.835 --> 00:08:35.755
You can actually do that inside of the dashboard,

00:08:35.755 --> 00:08:36.395
which is kind of cool.

00:08:36.395 --> 00:08:37.515
It's kind of a cool feature to have.

00:08:37.595 --> 00:08:39.515
I only use it really for like,

00:08:39.915 --> 00:08:42.355
sticking failed messages in a dead letter queue.

00:08:42.355 --> 00:08:44.315
And then I pause the delivery of the dead letter

00:08:44.315 --> 00:08:45.275
queue just to like,

00:08:45.275 --> 00:08:47.915
retain that data until I determine what I want to

00:08:47.915 --> 00:08:48.275
do with,

00:08:48.275 --> 00:08:48.635
like,

00:08:48.635 --> 00:08:50.075
how I want to process that data.

