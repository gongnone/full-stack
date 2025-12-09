WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.055 --> 00:00:00.375
All right,

00:00:00.375 --> 00:00:03.015
to start building out our evaluation workflow,

00:00:03.015 --> 00:00:04.495
essentially what we're going to want to do is

00:00:04.495 --> 00:00:06.095
we're going to want to head over to our data

00:00:06.095 --> 00:00:06.855
service project,

00:00:07.255 --> 00:00:08.495
and then under Source,

00:00:08.495 --> 00:00:09.815
I'm going to create a new folder.

00:00:09.815 --> 00:00:11.575
I'm going to call this Workflows.

00:00:12.534 --> 00:00:13.815
I always like to keep,

00:00:14.565 --> 00:00:16.925
all of the products or all of the services or

00:00:16.925 --> 00:00:18.165
subservices that I build,

00:00:18.615 --> 00:00:19.335
on top of,

00:00:19.335 --> 00:00:19.655
like,

00:00:19.815 --> 00:00:21.535
workflows or durable objects or queues.

00:00:21.535 --> 00:00:22.455
I kind of like to keep them

00:00:23.005 --> 00:00:24.765
in their own folders just to keep things,

00:00:24.765 --> 00:00:25.005
like,

00:00:25.005 --> 00:00:26.245
better organized and clean.

00:00:26.245 --> 00:00:27.165
It's really easy to

00:00:27.645 --> 00:00:29.965
navigate your code base as it gets bigger if you

00:00:29.965 --> 00:00:30.485
kind of follow,

00:00:30.485 --> 00:00:30.765
like,

00:00:30.765 --> 00:00:32.165
a structure and kind of stick to it.

00:00:32.165 --> 00:00:33.685
So we're going to call workflows,

00:00:33.685 --> 00:00:35.605
and all of the workflows that we build are going

00:00:35.605 --> 00:00:37.125
to live inside of this folder.

00:00:37.125 --> 00:00:39.485
So the first one is going to be a workflow

00:00:39.885 --> 00:00:41.565
with a file called,

00:00:42.145 --> 00:00:44.752
Destination Evaluation Workflow ts.

00:00:44.752 --> 00:00:47.016
And what this is going to do is this is going to,

00:00:47.506 --> 00:00:49.756
use browser rendering to render a destination

00:00:49.756 --> 00:00:50.116
page.

00:00:50.116 --> 00:00:51.036
It's going to use AI,

00:00:51.036 --> 00:00:53.216
it's going to stack some stuff up into R2.

00:00:53.296 --> 00:00:54.616
There's going to be multiple steps.

00:00:54.616 --> 00:00:57.016
So in order to get started with the workflow,

00:00:57.016 --> 00:00:58.456
what you're going to want to do is you're going to

00:00:58.456 --> 00:00:59.216
want to import

00:00:59.616 --> 00:01:00.776
the workflow entry point.

00:01:00.776 --> 00:01:01.616
That's the most important thing.

00:01:01.616 --> 00:01:03.336
We have a few other things here like the workflow

00:01:03.336 --> 00:01:04.576
step and the workflow event,

00:01:04.576 --> 00:01:06.966
but the main thing is this worker entry point.

00:01:07.156 --> 00:01:09.036
what this is going to do is this is going to.

00:01:09.036 --> 00:01:11.516
This is basically a class that implements all of

00:01:11.516 --> 00:01:12.836
the logic for a workflow,

00:01:12.916 --> 00:01:15.196
and then we're simply latching on to a specific

00:01:15.196 --> 00:01:17.996
method to build out the logic that's encapsulated

00:01:17.996 --> 00:01:18.836
inside of this,

00:01:18.986 --> 00:01:20.016
workflow entry point.

00:01:20.096 --> 00:01:22.856
So what we can do is we can create a class called

00:01:22.856 --> 00:01:23.616
the Destination

00:01:23.916 --> 00:01:25.036
Evaluation workflow,

00:01:25.116 --> 00:01:27.676
which extends the workflow entry point.

00:01:28.156 --> 00:01:28.436
Now,

00:01:28.436 --> 00:01:29.596
we have some other things going on here.

00:01:29.596 --> 00:01:31.826
We have an ENV that's passed in as a generic,

00:01:32.146 --> 00:01:33.626
These are our Cloudflare EMVs.

00:01:33.626 --> 00:01:34.866
We've kind of covered this in the past.

00:01:35.186 --> 00:01:37.826
And then this unknown is actually something we're

00:01:37.826 --> 00:01:38.666
going to be adding later.

00:01:38.666 --> 00:01:40.546
It's ultimately going to be adding the

00:01:40.866 --> 00:01:43.946
type of data that is passed into the workflow when

00:01:43.946 --> 00:01:44.306
it is,

00:01:44.306 --> 00:01:46.146
when it runs or when it's executed.

00:01:46.306 --> 00:01:48.386
So essentially from here,

00:01:48.386 --> 00:01:49.106
what we can do

00:01:49.516 --> 00:01:51.036
is we can say async

00:01:51.756 --> 00:01:52.156
run.

00:01:52.236 --> 00:01:52.516
Now,

00:01:52.516 --> 00:01:54.556
this run method that we're implementing is

00:01:54.556 --> 00:01:56.596
actually a method that's part of the workflow

00:01:56.596 --> 00:01:57.196
entry point.

00:01:57.596 --> 00:02:00.396
So if you just depending on which IDE you're

00:02:00.396 --> 00:02:00.636
using,

00:02:00.796 --> 00:02:02.396
you can hit enter on that.

00:02:02.396 --> 00:02:03.756
And what you're going to notice is,

00:02:04.216 --> 00:02:05.596
run takes in an event.

00:02:05.676 --> 00:02:07.996
And that event is going to actually have the data

00:02:08.076 --> 00:02:11.036
that we pass in when we want to run this workflow.

00:02:11.196 --> 00:02:13.676
And then it's also going to have a step which is,

00:02:14.536 --> 00:02:15.656
which is provided by

00:02:15.976 --> 00:02:17.016
this base class,

00:02:17.096 --> 00:02:18.376
the worker entry point.

00:02:18.536 --> 00:02:19.096
And this,

00:02:19.096 --> 00:02:21.576
this step allows us to create multiple different

00:02:21.576 --> 00:02:23.536
steps and configure each step the way that we

00:02:23.536 --> 00:02:23.816
want.

00:02:23.896 --> 00:02:25.256
And you can see that

00:02:25.836 --> 00:02:27.796
for the event it's actually inferring the type

00:02:27.796 --> 00:02:28.596
unknown from here,

00:02:28.596 --> 00:02:29.356
which is okay,

00:02:29.356 --> 00:02:31.476
because later we're going to go in and change that

00:02:31.476 --> 00:02:32.916
once we define what type we have.

00:02:32.916 --> 00:02:33.276
But

00:02:33.836 --> 00:02:34.834
this is ultimately

00:02:34.976 --> 00:02:35.376
a,

00:02:35.456 --> 00:02:37.776
this is ultimately a workflow and this workflow

00:02:37.776 --> 00:02:38.736
doesn't do anything right now.

00:02:38.736 --> 00:02:40.736
So inside of here we can take R step

00:02:41.476 --> 00:02:43.396
and you can say step dot do.

00:02:43.636 --> 00:02:44.986
Now these steps,

00:02:44.986 --> 00:02:46.516
are essentially asynchronous.

00:02:46.756 --> 00:02:49.396
So you can say await step dot do.

00:02:50.756 --> 00:02:51.156
And

00:02:51.876 --> 00:02:52.276
further,

00:02:52.516 --> 00:02:54.636
the thing that you can do on top of that is you

00:02:54.636 --> 00:02:55.716
can also say const

00:02:56.116 --> 00:02:57.076
collected data.

00:03:00.415 --> 00:03:01.303
const collected data.

00:03:01.303 --> 00:03:03.063
So this is basically data that we're going to

00:03:03.063 --> 00:03:05.463
capture by the return statement of a workflow.

00:03:05.463 --> 00:03:07.063
And we're going to say await

00:03:07.513 --> 00:03:08.233
step dot do.

00:03:08.393 --> 00:03:10.433
And then you're going to pass it a name or a

00:03:10.433 --> 00:03:12.233
description as to what that step is supposed to

00:03:12.233 --> 00:03:12.393
do.

00:03:12.393 --> 00:03:14.393
And this just makes it like really human

00:03:14.553 --> 00:03:15.313
understandable.

00:03:15.313 --> 00:03:16.993
When you're like looking at your workflow and all

00:03:16.993 --> 00:03:17.993
the steps that are executing,

00:03:17.993 --> 00:03:21.193
you can segment specifically what each step is and

00:03:21.193 --> 00:03:21.633
what they're doing.

00:03:21.633 --> 00:03:22.313
And if it failed,

00:03:22.313 --> 00:03:23.473
or if it didn't fail and whatnot.

00:03:23.473 --> 00:03:23.833
So,

00:03:23.973 --> 00:03:26.073
I'm calling this collect rendered destination

00:03:26.153 --> 00:03:26.633
page,

00:03:27.363 --> 00:03:27.763
data.

00:03:27.843 --> 00:03:28.243
That's,

00:03:28.243 --> 00:03:29.554
that's a pretty descriptive name.

00:03:29.554 --> 00:03:31.452
And then you're defining a method

00:03:31.792 --> 00:03:32.512
inside of do.

00:03:32.672 --> 00:03:34.992
So this is ultimately where your logic lives.

00:03:35.072 --> 00:03:37.512
So all the logic here right now we're just going

00:03:37.512 --> 00:03:38.632
to say console log,

00:03:38.632 --> 00:03:39.592
collecting rendered data,

00:03:39.592 --> 00:03:40.472
destination page.

00:03:40.472 --> 00:03:42.992
We're going to log that information up and we are

00:03:42.992 --> 00:03:43.872
going to return,

00:03:44.372 --> 00:03:45.632
an object of dummy data.

00:03:45.712 --> 00:03:46.112
Now,

00:03:46.432 --> 00:03:46.792
well,

00:03:46.792 --> 00:03:48.392
eventually what we're going to do is this is going

00:03:48.392 --> 00:03:49.952
to be the actual logic to

00:03:50.272 --> 00:03:51.472
do the browser rendering,

00:03:51.472 --> 00:03:52.472
taking that URL,

00:03:52.792 --> 00:03:53.352
loading,

00:03:53.412 --> 00:03:53.832
the page,

00:03:53.832 --> 00:03:54.512
rendering everything,

00:03:54.592 --> 00:03:56.472
extracting all the information and then returning

00:03:56.472 --> 00:03:56.712
it.

00:03:56.712 --> 00:03:58.792
But for now we're just going to do two things.

00:03:58.792 --> 00:03:59.472
We're going to say

00:03:59.832 --> 00:04:01.912
dummy data and then we're also going to say

00:04:02.392 --> 00:04:03.112
URL.

00:04:03.192 --> 00:04:05.832
And I want to the reason I'm doing this is I want

00:04:05.832 --> 00:04:08.472
to illustrate how you can actually access the URL.

00:04:08.472 --> 00:04:11.832
So the event is going to have a payload,

00:04:11.832 --> 00:04:14.432
and part of that payload will be data that you

00:04:14.432 --> 00:04:15.272
attach to it.

00:04:15.352 --> 00:04:17.592
And right now we have the type unknown,

00:04:17.592 --> 00:04:17.992
but

00:04:18.312 --> 00:04:20.792
when you specify a specific type here,

00:04:21.132 --> 00:04:22.942
that payload is going to be of that type.

00:04:22.942 --> 00:04:24.647
So we'll get into that in just a little bit.

00:04:24.647 --> 00:04:25.322
But ultimately,

00:04:25.322 --> 00:04:28.162
what we have here is a single step workflow

00:04:28.482 --> 00:04:29.602
that is returning

00:04:30.002 --> 00:04:30.882
collected data.

00:04:31.122 --> 00:04:31.522
Now,

00:04:31.922 --> 00:04:34.162
I'm just going to also console login out here,

00:04:36.882 --> 00:04:39.282
but inside of this run you could define more

00:04:39.282 --> 00:04:39.722
steps.

00:04:39.722 --> 00:04:42.282
So you could say step dot DO under here and add

00:04:42.282 --> 00:04:42.962
another step.

00:04:43.052 --> 00:04:44.282
you could say await,

00:04:45.322 --> 00:04:46.312
step.

00:04:46.382 --> 00:04:46.782
sleep,

00:04:46.782 --> 00:04:48.462
and you could basically tell it to sleep for a

00:04:48.462 --> 00:04:49.102
period of time.

00:04:49.802 --> 00:04:51.122
so there's a few different things that you can do

00:04:51.122 --> 00:04:51.322
there.

00:04:51.322 --> 00:04:53.282
But essentially under this run is where all that

00:04:53.282 --> 00:04:54.282
logic is going to live.

00:04:54.282 --> 00:04:54.922
But for now,

00:04:54.922 --> 00:04:57.442
what we want to do is we want to just deploy what

00:04:57.442 --> 00:05:00.642
we have right now just to ensure that everything's

00:05:00.642 --> 00:05:01.482
working as expected.

00:05:01.722 --> 00:05:03.642
And you can kind of like play around with,

00:05:03.912 --> 00:05:05.006
the workflow ui.

00:05:05.063 --> 00:05:05.143
So,

00:05:05.143 --> 00:05:06.663
in order to deploy your workflow,

00:05:06.663 --> 00:05:08.103
the very first thing that you're going to want to

00:05:08.103 --> 00:05:10.383
do is you're going to want to go to the index ts

00:05:10.383 --> 00:05:11.543
of your data service,

00:05:11.813 --> 00:05:12.403
application

00:05:12.883 --> 00:05:14.563
and then we can import,

00:05:15.253 --> 00:05:16.403
the destination

00:05:17.363 --> 00:05:18.563
evaluation workflow

00:05:19.263 --> 00:05:19.663
from,

00:05:21.595 --> 00:05:22.883
from our workflows folder.

00:05:22.883 --> 00:05:23.532
And actually,

00:05:23.532 --> 00:05:24.812
we're not importing it,

00:05:24.812 --> 00:05:26.172
we are going to export it.

00:05:26.172 --> 00:05:27.412
So we're exporting that.

00:05:27.812 --> 00:05:31.452
And then head over to your wrangler.JSON c file

00:05:31.452 --> 00:05:32.372
for your data service.

00:05:33.180 --> 00:05:34.741
And then what you're going to do is you're going

00:05:34.741 --> 00:05:36.861
to define a new type here.

00:05:36.941 --> 00:05:38.541
So we're going to create the

00:05:40.641 --> 00:05:43.521
for our workflows and you can have

00:05:44.291 --> 00:05:44.691
as many,

00:05:44.691 --> 00:05:46.011
I don't know if there's a hard limit,

00:05:46.011 --> 00:05:47.731
but you can have as really as many workflows as

00:05:47.731 --> 00:05:49.891
you want associated with a specific worker

00:05:49.891 --> 00:05:50.451
application.

00:05:50.771 --> 00:05:52.611
All you need to do is you need to provide a

00:05:52.611 --> 00:05:53.091
binding.

00:05:53.091 --> 00:05:55.051
So we're going to call this Destination Evaluation

00:05:55.051 --> 00:05:55.651
Workflow

00:05:56.131 --> 00:05:58.451
and then we have to give it a name.

00:05:58.451 --> 00:06:00.090
This is going to be the name that shows up in

00:06:00.090 --> 00:06:00.771
Cloudflare.

00:06:00.851 --> 00:06:02.291
So we're going to give this guy a name.

00:06:02.701 --> 00:06:04.291
and then the last thing that we're going to do is

00:06:04.291 --> 00:06:05.931
we have to give it the class name

00:06:06.491 --> 00:06:09.451
of what is exported in index ts,

00:06:09.531 --> 00:06:10.331
which is this.

00:06:10.831 --> 00:06:11.071
So

00:06:11.631 --> 00:06:12.191
from there,

00:06:12.591 --> 00:06:14.631
this is all the configuration that's needed for a

00:06:14.631 --> 00:06:14.991
workflow.

00:06:14.991 --> 00:06:15.981
It's actually pretty easy.

00:06:15.981 --> 00:06:18.701
and then you're going to navigate or CD into your

00:06:18.941 --> 00:06:19.741
data service

00:06:21.021 --> 00:06:23.341
application and then pnpm run,

00:06:23.421 --> 00:06:24.061
deploy.

00:06:25.954 --> 00:06:28.234
From here we're going to head over to our

00:06:28.234 --> 00:06:29.314
Cloudflare dashboard

00:06:29.634 --> 00:06:32.514
and then what you're going to notice is inside of

00:06:32.514 --> 00:06:32.994
Compute,

00:06:32.994 --> 00:06:34.674
we're going to have workflows,

00:06:34.674 --> 00:06:37.394
and we should see our workflow show up right here.

00:06:37.953 --> 00:06:39.624
So this is our actual workflow,

00:06:39.624 --> 00:06:40.794
that we just deployed,

00:06:41.034 --> 00:06:43.554
and they have like a really nice clean UI for it.

00:06:43.554 --> 00:06:44.874
And they've actually added a few different

00:06:44.874 --> 00:06:45.994
features in the last few months,

00:06:45.994 --> 00:06:47.914
which I am definitely a fan of.

00:06:47.914 --> 00:06:48.764
You have metrics,

00:06:49.044 --> 00:06:50.724
you can see like the number of instances,

00:06:50.804 --> 00:06:51.934
retry steps,

00:06:52.514 --> 00:06:52.834
all time,

00:06:52.834 --> 00:06:53.954
some interesting stuff there.

00:06:54.594 --> 00:06:54.994
And,

00:06:55.414 --> 00:06:56.974
Settings right now is pretty bare bone.

00:06:56.974 --> 00:06:58.534
It looks like they just have a delete button.

00:06:58.814 --> 00:07:00.774
but what I'm interested in is this trigger button

00:07:00.774 --> 00:07:01.614
under Instances.

00:07:01.934 --> 00:07:05.054
So this is a way that you can basically execute

00:07:05.054 --> 00:07:07.694
your workflow manually from the UI now.

00:07:07.694 --> 00:07:09.254
And what we're going to do is we're going to be

00:07:09.254 --> 00:07:10.864
executing it inside of our code base,

00:07:10.864 --> 00:07:11.634
programmatically,

00:07:11.874 --> 00:07:13.914
but you could also do it in the UI or you could

00:07:13.914 --> 00:07:15.754
use a Cloudflare CLI if you wanted to.

00:07:15.754 --> 00:07:16.874
So there's a few different options here,

00:07:16.874 --> 00:07:18.474
but for testing purposes and just kind of

00:07:18.474 --> 00:07:19.404
understanding what,

00:07:19.474 --> 00:07:21.034
what you can do is you can basically like,

00:07:21.034 --> 00:07:21.194
say,

00:07:21.194 --> 00:07:22.234
I want to trigger this workflow.

00:07:22.234 --> 00:07:22.514
And,

00:07:22.724 --> 00:07:25.114
a workflow is going to have a unique ID associated

00:07:25.114 --> 00:07:25.514
with it.

00:07:25.514 --> 00:07:26.594
If you provide it,

00:07:26.594 --> 00:07:28.434
that's the unique ID that it's going to use.

00:07:28.674 --> 00:07:29.074
And,

00:07:29.644 --> 00:07:30.564
if you don't provide it,

00:07:30.564 --> 00:07:32.124
it's going to randomly generate one for you.

00:07:32.364 --> 00:07:35.044
And then you can also provide parameters which we

00:07:35.044 --> 00:07:36.044
kind of discussed here,

00:07:36.044 --> 00:07:36.444
where

00:07:36.496 --> 00:07:38.496
right now our parameters are unknown.

00:07:38.496 --> 00:07:40.296
So we're not going to pass any parameters here.

00:07:40.296 --> 00:07:40.816
For now,

00:07:40.816 --> 00:07:42.416
we're just going to say trigger instance.

00:07:43.470 --> 00:07:45.070
And what's going to happen is we're going to see

00:07:45.070 --> 00:07:45.870
the step show up.

00:07:45.870 --> 00:07:47.531
So I'm going to reload that page really quick.

00:07:47.531 --> 00:07:49.540
And you can see that this instant has,

00:07:49.540 --> 00:07:51.490
one step and it is completed.

00:07:51.970 --> 00:07:53.570
So our workflow is actually working

00:07:53.890 --> 00:07:54.530
as expected.

00:07:54.690 --> 00:07:56.610
This is kind of like the best way to validate it.

00:07:56.610 --> 00:07:58.210
You can see when it started and ended.

00:07:58.900 --> 00:08:01.020
and what we're going to notice here is this is the

00:08:01.020 --> 00:08:01.540
output.

00:08:01.620 --> 00:08:02.900
So this is the data

00:08:03.300 --> 00:08:05.140
that was returned right here.

00:08:05.220 --> 00:08:05.500
Now,

00:08:05.500 --> 00:08:07.180
if you don't return data in a step,

00:08:07.180 --> 00:08:07.420
if,

00:08:07.420 --> 00:08:07.580
like,

00:08:07.580 --> 00:08:09.380
you're just doing some type of data mutation

00:08:10.090 --> 00:08:12.090
and you're not actually returning any data that's

00:08:12.090 --> 00:08:13.210
used for the,

00:08:13.710 --> 00:08:14.350
actual

00:08:14.533 --> 00:08:15.410
step itself,

00:08:15.810 --> 00:08:16.210
you know,

00:08:16.210 --> 00:08:18.210
you obviously wouldn't capture that as a variable

00:08:18.210 --> 00:08:20.210
and you probably wouldn't have a return statement.

00:08:20.290 --> 00:08:22.570
And then you would have no data here,

00:08:22.570 --> 00:08:25.010
but you can see that the output is dummy data,

00:08:25.010 --> 00:08:26.530
which we've hard coded here.

00:08:26.530 --> 00:08:29.330
So from here we know that our workflow is working

00:08:29.330 --> 00:08:29.890
as expected.

00:08:30.290 --> 00:08:30.690
And,

00:08:30.790 --> 00:08:31.670
if it fails,

00:08:31.670 --> 00:08:33.590
you could also retry it inside of the ui,

00:08:33.590 --> 00:08:34.270
which is pretty cool.

00:08:34.310 --> 00:08:36.310
and the UI does give you kind of a nice space

00:08:36.310 --> 00:08:37.030
where you can see,

00:08:37.030 --> 00:08:37.350
like,

00:08:37.350 --> 00:08:38.830
once you have tons of workflows going,

00:08:38.830 --> 00:08:41.550
you can see like holistically how many are failing

00:08:41.550 --> 00:08:43.010
if you have any errors pop up.

00:08:43.230 --> 00:08:45.870
and then you can rerun jobs manually if,

00:08:45.870 --> 00:08:46.190
like,

00:08:46.190 --> 00:08:48.150
your use case dictates that.

00:08:48.150 --> 00:08:50.150
Usually it's more programmatic and you wouldn't

00:08:50.150 --> 00:08:50.910
want your,

00:08:51.230 --> 00:08:51.870
you know,

00:08:52.110 --> 00:08:54.670
management of workflows to live inside of the ui.

00:08:54.670 --> 00:08:56.190
But for just understanding,

00:08:56.340 --> 00:08:57.220
how this works,

00:08:57.460 --> 00:08:58.580
it's a great UI for it.

00:08:58.580 --> 00:08:59.140
It's very simple.

00:08:59.140 --> 00:08:59.380
So,

00:08:59.530 --> 00:08:59.770
so

00:09:00.570 --> 00:09:02.010
that's workflows in a nutshell.

00:09:02.010 --> 00:09:03.330
So now what we're going to do is we're actually

00:09:03.330 --> 00:09:05.170
going to start building on top of this workflow

00:09:05.170 --> 00:09:06.410
now that we have it deployed,

00:09:06.650 --> 00:09:07.690
and we're going to,

00:09:07.820 --> 00:09:10.270
integrate with browser rendering and the AI SDK

00:09:10.270 --> 00:09:11.510
and the cloudflare workers,

00:09:11.920 --> 00:09:12.640
AI product.

00:09:12.800 --> 00:09:14.240
So there's a lot that we're going to do here,

00:09:14.240 --> 00:09:14.894
which is pretty cool.

