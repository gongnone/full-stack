WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.000 --> 00:00:00.230
okay,

00:00:00.230 --> 00:00:02.230
so now that our smart routing system is built out,

00:00:02.230 --> 00:00:04.190
let's move a layer back into the stack and start

00:00:04.190 --> 00:00:05.710
building out our queue pipeline.

00:00:05.790 --> 00:00:06.670
So queues,

00:00:06.670 --> 00:00:07.870
if you haven't used them before,

00:00:08.030 --> 00:00:11.230
are in my opinion a very underlooked compute

00:00:11.230 --> 00:00:12.190
primitive within

00:00:12.509 --> 00:00:14.270
like a full stack ecosystem.

00:00:14.510 --> 00:00:16.310
I think that there's a lot of developers that

00:00:16.310 --> 00:00:17.350
don't have experience with queues.

00:00:17.350 --> 00:00:18.670
They don't really know why to use them.

00:00:18.670 --> 00:00:21.830
But using them can actually make your systems more

00:00:21.830 --> 00:00:22.350
resilient,

00:00:22.430 --> 00:00:22.990
modular,

00:00:22.990 --> 00:00:23.710
maintainable

00:00:24.180 --> 00:00:25.540
and can really help you scale.

00:00:25.640 --> 00:00:27.690
so I mean you don't need it like you don't need to

00:00:27.690 --> 00:00:29.690
use queues just because you want a system to be

00:00:29.690 --> 00:00:30.890
able to handle high volume.

00:00:30.970 --> 00:00:32.810
You can use it for a lot of different reasons.

00:00:33.410 --> 00:00:35.770
from my background kind of coming from like a data

00:00:35.770 --> 00:00:37.170
and back end engineering

00:00:37.890 --> 00:00:39.570
space at a really large company,

00:00:39.970 --> 00:00:43.290
we heavily used a technology called Apache Kafka

00:00:43.290 --> 00:00:45.090
which is just kind of an event based queuing

00:00:45.090 --> 00:00:47.730
mechanism that has a lot of different nuances,

00:00:47.970 --> 00:00:49.910
on how you can build like a distributed system,

00:00:49.910 --> 00:00:52.590
how you can manage state in a really large data

00:00:52.590 --> 00:00:53.430
ecosystem.

00:00:53.890 --> 00:00:56.450
But there are lighter weight versions of like

00:00:56.450 --> 00:00:57.410
queuing mechanisms.

00:00:57.410 --> 00:00:58.850
Cloudflare queues is one of them.

00:00:58.910 --> 00:01:00.960
if you Google you're going to probably come across

00:01:00.960 --> 00:01:01.760
Rabbit mq.

00:01:01.760 --> 00:01:03.520
This is a pretty big open source queuing

00:01:04.240 --> 00:01:04.900
offering.

00:01:05.220 --> 00:01:07.780
Amazon has a Amazon simple queue service.

00:01:08.100 --> 00:01:10.420
Redis also has a very popular pub sub

00:01:10.780 --> 00:01:11.300
offering.

00:01:11.300 --> 00:01:13.580
They also have Redis streams which if you're

00:01:13.580 --> 00:01:16.220
already using Redis you can configure a Redis

00:01:16.220 --> 00:01:18.940
cluster to essentially act as like a queuing

00:01:18.940 --> 00:01:19.580
mechanism.

00:01:19.874 --> 00:01:21.845
so what are queues and why would you want to use

00:01:21.845 --> 00:01:22.125
them?

00:01:22.535 --> 00:01:23.815
At a very high level

00:01:24.135 --> 00:01:26.735
a queue is just kind of a middle layer inside of a

00:01:26.735 --> 00:01:29.735
distributed system where you can offload some data

00:01:29.815 --> 00:01:31.575
to be processed in the background.

00:01:31.655 --> 00:01:32.055
So

00:01:32.245 --> 00:01:34.215
like a high level data flow of this would be like

00:01:34.215 --> 00:01:37.095
you have some application that has some data and

00:01:37.095 --> 00:01:40.295
it writes it to a queue and then you can build a

00:01:40.295 --> 00:01:42.095
totally separate decoupled bit of

00:01:42.655 --> 00:01:45.535
application logic that acts as a consumer that

00:01:45.535 --> 00:01:48.655
reads that data and then processes it in some way.

00:01:48.815 --> 00:01:51.095
So why would you want to use a queue and in what

00:01:51.095 --> 00:01:52.655
scenarios would you want to use a queue?

00:01:52.655 --> 00:01:53.055
So

00:01:53.255 --> 00:01:56.085
from my kind of like my mental model for using

00:01:56.085 --> 00:01:58.565
queues is basically saying if I have a background

00:01:58.565 --> 00:02:00.245
task where I want to

00:02:00.725 --> 00:02:01.765
process some data,

00:02:02.005 --> 00:02:04.145
and I don't want it to be dependent on an HTTP

00:02:04.145 --> 00:02:04.465
request.

00:02:04.465 --> 00:02:08.225
So like imagine a user hits an API and gives the

00:02:08.225 --> 00:02:09.065
API some data.

00:02:09.465 --> 00:02:11.265
Now if that API is going to do a whole bunch of

00:02:11.265 --> 00:02:13.305
stuff and let's say that request might take like

00:02:13.305 --> 00:02:13.629
15,

00:02:13.701 --> 00:02:14.585
30 seconds,

00:02:14.745 --> 00:02:16.585
if the user closes that connection,

00:02:16.745 --> 00:02:18.905
you're also probably going to lose data and you're

00:02:18.905 --> 00:02:20.345
going to stop processing that request

00:02:20.465 --> 00:02:21.245
throughout that process.

00:02:21.565 --> 00:02:23.405
So in that scenario I would say

00:02:23.745 --> 00:02:25.865
put that data in a background task and in this

00:02:25.865 --> 00:02:28.025
case a queue and then respond to the user,

00:02:28.025 --> 00:02:28.385
hey,

00:02:28.385 --> 00:02:29.545
we're processing your data,

00:02:29.545 --> 00:02:29.825
right?

00:02:29.825 --> 00:02:31.425
And then your UI application can,

00:02:31.505 --> 00:02:32.465
can handle that,

00:02:33.005 --> 00:02:34.245
that state to basically say like,

00:02:34.245 --> 00:02:34.565
okay,

00:02:34.565 --> 00:02:34.845
yeah,

00:02:34.845 --> 00:02:35.245
so this,

00:02:35.245 --> 00:02:36.485
this data is being processed,

00:02:36.485 --> 00:02:38.085
I'm going to check back in 10 seconds,

00:02:38.085 --> 00:02:38.725
30 seconds,

00:02:38.725 --> 00:02:40.765
whatever to like see if that task is done.

00:02:41.105 --> 00:02:43.665
there's also this concept of event driven systems

00:02:43.665 --> 00:02:44.785
where you have

00:02:45.125 --> 00:02:47.745
one event from a system that kind of cascades and

00:02:47.745 --> 00:02:48.985
triggers other things to happen.

00:02:49.145 --> 00:02:50.705
queues provide a

00:02:51.115 --> 00:02:53.115
perfect middle ground to

00:02:53.595 --> 00:02:54.365
facilitate

00:02:54.365 --> 00:02:56.415
event driven systems so you can build application

00:02:56.415 --> 00:02:59.295
logic on top of like a cascading series of things

00:02:59.295 --> 00:02:59.855
happening.

00:03:00.255 --> 00:03:03.095
another very important scenario is no data loss.

00:03:03.095 --> 00:03:05.255
So like queues usually will guarantee at least

00:03:05.255 --> 00:03:06.094
once delivery.

00:03:06.094 --> 00:03:06.735
Which means,

00:03:07.325 --> 00:03:09.215
if you write some data to a queue,

00:03:09.455 --> 00:03:12.215
you can guarantee that data is on a queue and you

00:03:12.215 --> 00:03:14.535
can process it and handle like failure.

00:03:14.535 --> 00:03:14.975
So if,

00:03:15.055 --> 00:03:15.975
if data fails,

00:03:15.975 --> 00:03:17.055
you can basically say hey,

00:03:17.055 --> 00:03:18.095
I don't want to complete

00:03:18.635 --> 00:03:19.795
the processing of this data.

00:03:19.795 --> 00:03:22.355
And then the queue can maintain that data up until

00:03:22.355 --> 00:03:23.765
it's successfully processed.

00:03:23.765 --> 00:03:24.615
so this is where

00:03:24.935 --> 00:03:25.975
like payments,

00:03:26.295 --> 00:03:27.015
bank information,

00:03:27.175 --> 00:03:27.535
different,

00:03:27.535 --> 00:03:29.015
like really important transactions,

00:03:29.015 --> 00:03:31.295
you can like put data on a queue to kind of

00:03:31.295 --> 00:03:33.375
guarantee that you don't want to guarantee

00:03:33.375 --> 00:03:35.655
application logic that isn't going to lose data

00:03:35.895 --> 00:03:37.335
and then modular services.

00:03:37.495 --> 00:03:39.655
So like if you have a really bloated full stack

00:03:39.655 --> 00:03:41.335
framework that's doing a whole bunch of stuff,

00:03:41.495 --> 00:03:43.535
sending data to a queue and having a lighter

00:03:43.535 --> 00:03:45.735
weight back in service that manages that data.

00:03:45.905 --> 00:03:47.435
of lot allows your system to be a little bit more

00:03:47.435 --> 00:03:48.595
maintainable and scalable,

00:03:48.685 --> 00:03:50.055
from a code based perspective.

00:03:50.055 --> 00:03:52.135
So Cloudflare queues has a bunch of different

00:03:52.135 --> 00:03:52.495
features.

00:03:52.495 --> 00:03:52.775
You know,

00:03:52.775 --> 00:03:54.775
you have your basic flow where you have a producer

00:03:54.775 --> 00:03:56.815
that can write some data to a queue and then you

00:03:56.815 --> 00:03:59.695
have a consumer where you implement logic to get

00:03:59.695 --> 00:04:01.614
that data from a queue and then process it

00:04:01.614 --> 00:04:02.043
somehow.

00:04:02.139 --> 00:04:05.259
Now some of the cool features about queues is the

00:04:05.259 --> 00:04:07.939
built in retry logic so you can configure a queue

00:04:07.939 --> 00:04:08.779
to basically say,

00:04:08.939 --> 00:04:09.299
hey,

00:04:09.299 --> 00:04:10.299
I'm going to get some data,

00:04:10.459 --> 00:04:12.379
and then when a consumer is reading it,

00:04:12.379 --> 00:04:13.579
if that data fails,

00:04:13.659 --> 00:04:15.259
it will automatically retry.

00:04:15.259 --> 00:04:17.919
And you can set that logic to retry three times,

00:04:17.919 --> 00:04:18.399
one time,

00:04:18.399 --> 00:04:20.359
no times however you want that to be

00:04:21.629 --> 00:04:22.589
out of the box.

00:04:22.909 --> 00:04:25.109
There's also this concept called the dead letter

00:04:25.109 --> 00:04:25.469
queue,

00:04:25.709 --> 00:04:28.589
where if you write data to a queue and it's

00:04:28.589 --> 00:04:30.509
processed by a consumer and then that

00:04:30.689 --> 00:04:32.689
data fails a certain number of times,

00:04:33.009 --> 00:04:35.369
you can offload that data back to a dead letter

00:04:35.369 --> 00:04:37.449
queue where that data can kind of be saved and

00:04:37.449 --> 00:04:39.649
then you can process it later from that same

00:04:39.649 --> 00:04:40.111
consumer.

00:04:40.111 --> 00:04:40.762
You could also,

00:04:40.842 --> 00:04:41.802
in like a more

00:04:42.202 --> 00:04:43.182
complicated system,

00:04:43.872 --> 00:04:45.872
you could have a dead letter queue where data goes

00:04:45.872 --> 00:04:46.832
to a consumer,

00:04:46.832 --> 00:04:47.432
it fails,

00:04:47.432 --> 00:04:48.552
it goes to a dead letter queue.

00:04:48.552 --> 00:04:50.352
And then you have a totally different type of

00:04:50.352 --> 00:04:52.912
service and pipeline that reads that failed data

00:04:52.912 --> 00:04:54.572
and then processes it some other way.

00:04:54.580 --> 00:04:55.940
So there's a whole bunch of different

00:04:56.570 --> 00:04:58.810
features that are kind of built into queues that

00:04:58.810 --> 00:05:00.650
allow you to build resilient systems.

00:05:00.650 --> 00:05:01.930
And we're going to go through this process,

00:05:01.930 --> 00:05:03.610
we're going to integrate it into our

00:05:04.110 --> 00:05:06.350
data pipeline for our smart

00:05:06.830 --> 00:05:07.630
routing service

00:05:07.950 --> 00:05:10.710
to basically get link clicks and then getting the

00:05:10.710 --> 00:05:11.230
link clicks.

00:05:11.230 --> 00:05:12.630
We're going to facilitate a whole bunch of

00:05:12.630 --> 00:05:13.630
different other data services,

00:05:14.170 --> 00:05:15.450
going to actually power the

00:05:16.540 --> 00:05:17.180
AI

00:05:17.740 --> 00:05:18.780
analyzing of

00:05:19.040 --> 00:05:19.760
web pages.

00:05:19.840 --> 00:05:22.000
It'll also power the web sockets,

00:05:22.080 --> 00:05:23.110
it will also power

00:05:23.650 --> 00:05:26.210
all of the analytics that we see on our dashboard.

00:05:26.290 --> 00:05:26.690
So

00:05:26.760 --> 00:05:28.570
the queue is kind of going to be like the heart of

00:05:28.570 --> 00:05:29.329
getting that data,

00:05:29.410 --> 00:05:31.850
making sure that data saved and then it's going to

00:05:31.850 --> 00:05:33.650
facilitate a whole bunch of different types of

00:05:33.730 --> 00:05:34.770
processes that happen

00:05:34.860 --> 00:05:35.989
when we get our link click.

