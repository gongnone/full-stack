WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.028 --> 00:00:00.468
All right,

00:00:00.468 --> 00:00:03.708
so we've gone pretty deep into the front end and

00:00:03.708 --> 00:00:05.148
the thin little back end,

00:00:05.568 --> 00:00:08.288
that is facing the user of this application,

00:00:08.288 --> 00:00:09.888
which is built on trpc.

00:00:10.288 --> 00:00:10.688
Now,

00:00:11.098 --> 00:00:13.358
I know we kind of touched over a lot of these

00:00:13.358 --> 00:00:15.478
topics really quickly and that's kind of by

00:00:15.478 --> 00:00:15.798
design.

00:00:15.878 --> 00:00:17.998
I don't want this to be a framework course.

00:00:17.998 --> 00:00:20.558
I want this to be building on top of Cloudflare

00:00:20.558 --> 00:00:20.918
course.

00:00:20.918 --> 00:00:21.318
So,

00:00:21.508 --> 00:00:23.238
before we actually get into this next section,

00:00:23.238 --> 00:00:24.958
which is kind of where we're going to go much,

00:00:24.958 --> 00:00:27.428
much deeper into the Cloudflare services and

00:00:27.578 --> 00:00:28.938
infrastructure and different like,

00:00:28.938 --> 00:00:30.458
products that we're building on top of,

00:00:30.468 --> 00:00:32.478
that's kind of the meat of this course.

00:00:33.008 --> 00:00:35.188
I do want to get in the habit of continuously

00:00:35.188 --> 00:00:36.578
deploying throughout this,

00:00:36.578 --> 00:00:37.408
throughout this course.

00:00:37.408 --> 00:00:38.168
Just so like,

00:00:38.248 --> 00:00:40.048
you're never in a position where you're,

00:00:40.048 --> 00:00:40.528
you know,

00:00:40.528 --> 00:00:41.608
six hours into a course,

00:00:41.608 --> 00:00:43.368
you try to deploy and something doesn't work.

00:00:43.768 --> 00:00:44.768
I kind of model,

00:00:44.768 --> 00:00:46.888
I'm going to model this after the way that I build

00:00:46.888 --> 00:00:49.528
products for other people or for myself where,

00:00:50.068 --> 00:00:51.588
I'm incrementally building things

00:00:51.898 --> 00:00:53.578
and then I'm continuously deploying.

00:00:53.578 --> 00:00:55.418
So I'm never kind of in a position of like

00:00:55.418 --> 00:00:56.018
figuring out like,

00:00:56.018 --> 00:00:56.538
holy cow,

00:00:56.538 --> 00:00:56.858
like

00:00:57.258 --> 00:00:59.378
I'm so deep into this project and now I'm having

00:00:59.378 --> 00:01:00.568
an issue with the deployment.

00:01:00.568 --> 00:01:01.278
I like to like,

00:01:01.278 --> 00:01:03.678
incrementally do things just because like one,

00:01:03.678 --> 00:01:04.838
you're shipping really quickly,

00:01:04.838 --> 00:01:07.117
you're able to validate changes really fast and

00:01:07.117 --> 00:01:09.118
your project is always in a state that's just kind

00:01:09.118 --> 00:01:09.918
of ready to go.

00:01:09.998 --> 00:01:10.398
So,

00:01:11.078 --> 00:01:11.958
with that said,

00:01:12.118 --> 00:01:14.278
let's head back over to our user application.

00:01:14.358 --> 00:01:15.638
It's probably still running.

00:01:15.638 --> 00:01:17.398
We're going to go ahead and kill that application

00:01:17.958 --> 00:01:18.518
and then,

00:01:19.108 --> 00:01:21.428
from earlier in the course you're going to know

00:01:21.428 --> 00:01:23.268
that we have to run one simple command.

00:01:23.588 --> 00:01:25.748
And that simple command is living inside of this

00:01:25.748 --> 00:01:26.228
packages,

00:01:26.408 --> 00:01:26.988
inside of this

00:01:26.988 --> 00:01:27.868
package JSON,

00:01:28.188 --> 00:01:30.668
we have a deploy command right here.

00:01:30.828 --> 00:01:31.032
So

00:01:31.054 --> 00:01:32.814
essentially what we're going to do is we're going

00:01:32.814 --> 00:01:34.014
to say pnpm,

00:01:34.334 --> 00:01:34.734
run,

00:01:35.054 --> 00:01:35.694
deploy.

00:01:36.814 --> 00:01:38.814
Now this specific project

00:01:39.294 --> 00:01:42.534
does fail if you have any like type errors or

00:01:42.534 --> 00:01:44.254
linting errors in the UI site.

00:01:44.254 --> 00:01:45.824
So if you do get a failure to,

00:01:45.974 --> 00:01:46.534
that's okay.

00:01:47.214 --> 00:01:49.734
I kind of intentionally got us a failure here just

00:01:49.734 --> 00:01:51.054
so we can kind of see what's happening.

00:01:51.054 --> 00:01:52.974
But you can see that this is saying

00:01:53.454 --> 00:01:54.374
set is connected,

00:01:54.374 --> 00:01:55.214
is declared,

00:01:55.294 --> 00:01:56.574
but it is never read.

00:01:56.814 --> 00:01:59.214
So we can head over to our,

00:01:59.554 --> 00:02:00.374
click socket.

00:02:00.534 --> 00:02:02.214
And yours might not be this way,

00:02:02.214 --> 00:02:03.814
but you can notice that

00:02:03.914 --> 00:02:06.034
it's throwing an error because this is a dummy

00:02:06.034 --> 00:02:08.554
component that we haven't implemented yet and it

00:02:08.714 --> 00:02:10.904
is failing just because we've defined something

00:02:10.904 --> 00:02:11.624
that's not used.

00:02:11.944 --> 00:02:13.504
And that's okay for now.

00:02:13.504 --> 00:02:14.424
I'm just going to

00:02:14.984 --> 00:02:16.904
I'm just going to delete it and just say

00:02:17.544 --> 00:02:18.264
underscore.

00:02:18.344 --> 00:02:20.344
So this is kind of just like,

00:02:20.974 --> 00:02:22.764
your linting tool will look at this and be like,

00:02:22.764 --> 00:02:23.004
okay,

00:02:23.004 --> 00:02:23.204
yeah,

00:02:23.204 --> 00:02:24.804
this is intentionally not being used.

00:02:25.044 --> 00:02:25.444
So

00:02:26.084 --> 00:02:28.404
I'm going to go ahead and clear and I'm going to

00:02:28.404 --> 00:02:28.924
deploy again.

00:02:28.924 --> 00:02:30.804
So this deployment should be successful.

00:02:30.804 --> 00:02:31.884
So just note like,

00:02:31.884 --> 00:02:33.284
if you run into deployment issues,

00:02:33.364 --> 00:02:34.404
not the end of the world,

00:02:34.454 --> 00:02:36.224
just read through like what it's saying.

00:02:36.224 --> 00:02:37.824
You should be able to figure it out quickly.

00:02:37.824 --> 00:02:39.424
And especially with AI these days,

00:02:39.424 --> 00:02:41.824
like being able to pop open your cursor tab and

00:02:41.824 --> 00:02:42.344
then ask like,

00:02:42.344 --> 00:02:42.544
hey,

00:02:42.544 --> 00:02:43.144
I got this error.

00:02:43.144 --> 00:02:43.864
What's going on?

00:02:43.864 --> 00:02:45.384
These types of things that should be able to

00:02:45.384 --> 00:02:45.944
figure out very,

00:02:45.944 --> 00:02:46.424
very quick.

00:02:47.394 --> 00:02:47.674
so this,

00:02:47.674 --> 00:02:49.714
what we're noticing is it's uploading all of our

00:02:49.714 --> 00:02:50.914
assets from our build.

00:02:51.104 --> 00:02:51.594
it's basically,

00:02:51.594 --> 00:02:52.594
it's built all of them,

00:02:52.594 --> 00:02:53.314
all of the stuff.

00:02:53.314 --> 00:02:54.154
It's stuck it into,

00:02:54.764 --> 00:02:56.054
the dist folder and

00:02:56.208 --> 00:02:57.888
it has uploaded it to

00:02:58.098 --> 00:02:59.938
Cloudflare CD and all around the world.

00:03:00.258 --> 00:03:02.418
And what you also will probably note is

00:03:02.738 --> 00:03:04.898
we have this EMV DB

00:03:05.298 --> 00:03:06.578
and this has

00:03:06.908 --> 00:03:09.708
this is basically the ID of our database because

00:03:09.868 --> 00:03:11.388
we added our database

00:03:12.848 --> 00:03:14.688
or we should have added our database in this

00:03:14.688 --> 00:03:15.168
wrangler,

00:03:15.418 --> 00:03:15.808
file.

00:03:15.808 --> 00:03:16.608
Or in this wrangler.

00:03:16.608 --> 00:03:16.888
Yeah,

00:03:16.888 --> 00:03:18.448
in this wrangler JSON file.

00:03:18.688 --> 00:03:20.494
So if you go over to this URL,

00:03:22.689 --> 00:03:25.132
our project should be deployed and it should be

00:03:25.132 --> 00:03:25.612
usable.

00:03:26.172 --> 00:03:27.932
And notice how snappy this is.

00:03:27.932 --> 00:03:30.132
Like before when we were running this locally,

00:03:30.132 --> 00:03:31.012
when you click on this button,

00:03:31.012 --> 00:03:32.012
you get a lot of loading.

00:03:32.012 --> 00:03:34.572
But this is actually the real behavior of how

00:03:34.572 --> 00:03:35.502
snappy it should be.

00:03:35.562 --> 00:03:37.032
when you deploy this thing.

00:03:37.032 --> 00:03:39.232
So you click and it instantly goes over.

00:03:39.232 --> 00:03:39.632
So,

00:03:39.872 --> 00:03:42.092
this is real data that's sitting in our database.

00:03:42.172 --> 00:03:44.148
We can update the data as well.

00:03:44.148 --> 00:03:45.301
We can add some

00:03:45.611 --> 00:03:47.051
GEO routing logic.

00:03:47.051 --> 00:03:47.451
So

00:03:47.524 --> 00:03:49.194
just a random URL here.

00:03:49.585 --> 00:03:52.183
And when you refresh that data should be,

00:03:52.323 --> 00:03:53.123
should persist.

00:03:53.203 --> 00:03:53.603
So

00:03:53.923 --> 00:03:54.323
yeah,

00:03:54.323 --> 00:03:56.043
just want to get in this habit of continuously

00:03:56.043 --> 00:03:56.443
deploying.

00:03:56.443 --> 00:03:58.203
So at this point just make sure your UI is

00:03:58.203 --> 00:04:00.123
deployed and then we're going to move deeper down

00:04:00.123 --> 00:04:00.723
into the stack.

00:04:00.723 --> 00:04:02.303
We're actually going to start building out,

00:04:02.903 --> 00:04:05.303
the API that manages the link routing.

00:04:05.303 --> 00:04:06.423
We're going to build out queues,

00:04:06.423 --> 00:04:07.463
we're going to build out workflows.

00:04:07.463 --> 00:04:08.503
We're going to work with A.I.

00:04:08.503 --> 00:04:09.203
it's going to be.

00:04:09.203 --> 00:04:10.483
It's going to be pretty cool what we're going to

00:04:10.483 --> 00:04:11.323
learn from here on out.

00:04:11.323 --> 00:04:13.403
So I hope you've enjoyed the course this far and

00:04:13.403 --> 00:04:13.923
do please,

00:04:13.923 --> 00:04:14.163
like,

00:04:14.163 --> 00:04:15.683
let me know if there's anything where

00:04:16.003 --> 00:04:17.883
you feel like can be improved or if it's not

00:04:17.883 --> 00:04:18.643
working as expected.

00:04:18.723 --> 00:04:20.563
And then I'm going to continuously make sure that

00:04:20.563 --> 00:04:22.163
these course sections are updated,

00:04:22.463 --> 00:04:24.743
so people don't get stuck and people are actually

00:04:24.743 --> 00:04:26.943
able to progress fast throughout the process,

00:04:26.943 --> 00:04:27.343
so.

