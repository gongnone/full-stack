WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.048 --> 00:00:00.288
All right,

00:00:00.288 --> 00:00:01.368
to get this project started,

00:00:01.368 --> 00:00:03.048
you're going to want to head over to the starter

00:00:03.048 --> 00:00:05.408
repo that contains all the starter code for this

00:00:05.408 --> 00:00:05.728
course.

00:00:06.048 --> 00:00:07.328
And what we're going to do is we're going to go

00:00:07.328 --> 00:00:09.488
ahead and fork it into your own GitHub account.

00:00:09.488 --> 00:00:10.768
So if you don't have a GitHub account,

00:00:10.768 --> 00:00:12.288
take this time to go create one.

00:00:12.448 --> 00:00:14.248
It's really important to have a GitHub account for

00:00:14.248 --> 00:00:16.448
this course because towards the end we're actually

00:00:16.448 --> 00:00:17.968
going to go through the process of building

00:00:17.968 --> 00:00:19.968
deployment pipelines that do automated

00:00:19.968 --> 00:00:20.448
deployments,

00:00:20.448 --> 00:00:21.648
and that's powered by GitHub.

00:00:21.648 --> 00:00:21.818
So.

00:00:21.968 --> 00:00:22.208
So,

00:00:22.558 --> 00:00:23.768
just make sure you have a GitHub account.

00:00:23.768 --> 00:00:25.368
You could just obviously clone the project,

00:00:25.688 --> 00:00:27.208
but then you're not going to be able to push

00:00:27.208 --> 00:00:27.808
changes to it,

00:00:27.808 --> 00:00:29.408
and then you're obviously not going to be able to

00:00:29.408 --> 00:00:31.048
connect your GitHub account to your Cloudflare

00:00:31.048 --> 00:00:31.368
account.

00:00:31.688 --> 00:00:32.888
So once you have this,

00:00:33.208 --> 00:00:34.488
once you have this repo

00:00:34.506 --> 00:00:35.173
forked,

00:00:35.235 --> 00:00:37.155
copy the link to the actual,

00:00:37.395 --> 00:00:38.835
the git link to the repo,

00:00:39.075 --> 00:00:41.035
and then you can head over to a terminal and say

00:00:41.035 --> 00:00:41.715
git clone

00:00:42.755 --> 00:00:45.195
and pass in that repo name and then you can CD

00:00:45.195 --> 00:00:46.115
into the repo.

00:00:46.415 --> 00:00:47.575
Now if you use GitHub Desktop,

00:00:47.575 --> 00:00:48.295
that's totally fine.

00:00:48.295 --> 00:00:49.375
You can just go through that process.

00:00:49.375 --> 00:00:50.815
And if you've never used Git before,

00:00:51.055 --> 00:00:52.295
I'll link a few videos,

00:00:52.295 --> 00:00:53.415
just to kind of get you started.

00:00:53.495 --> 00:00:55.415
But this course is definitely not going to go into

00:00:55.415 --> 00:00:57.175
like the nitty gritties of how to use git.

00:00:57.555 --> 00:00:59.495
and from there we're going to open up Cursor.

00:01:00.135 --> 00:01:01.655
You can use whatever IDE you want,

00:01:01.655 --> 00:01:03.055
but for this course I'm going to go ahead and use

00:01:03.055 --> 00:01:03.455
Cursor,

00:01:03.455 --> 00:01:04.738
because I know a lot of folks use it.

00:01:04.837 --> 00:01:05.077
All right,

00:01:05.077 --> 00:01:05.237
now,

00:01:05.237 --> 00:01:06.797
before we dive too deep into the code,

00:01:06.797 --> 00:01:08.877
let's go ahead and understand the file structure

00:01:08.877 --> 00:01:09.557
of this project.

00:01:09.797 --> 00:01:10.037
Now,

00:01:10.037 --> 00:01:10.677
right off the bat,

00:01:10.677 --> 00:01:13.077
you might notice we don't have a source folder at

00:01:13.077 --> 00:01:14.517
the root level of this repo.

00:01:14.597 --> 00:01:16.837
And the reason we don't have a source folder at

00:01:16.837 --> 00:01:18.957
the root level of this repo is because this is a

00:01:18.957 --> 00:01:20.197
mono repo setup.

00:01:20.357 --> 00:01:22.557
What that means is essentially we have multiple

00:01:22.557 --> 00:01:24.037
different applications or services

00:01:24.517 --> 00:01:27.317
that are packaged inside of a single repository.

00:01:27.897 --> 00:01:28.577
As you can see here.

00:01:28.577 --> 00:01:29.377
Inside of Apps,

00:01:29.377 --> 00:01:31.377
we have two different services inside of here,

00:01:31.377 --> 00:01:33.417
and each one of these services have their own

00:01:33.737 --> 00:01:35.897
source folder that contains all the source code.

00:01:35.897 --> 00:01:38.857
But then we also have a packages folder which

00:01:38.857 --> 00:01:40.497
contains a Data Ops package.

00:01:40.497 --> 00:01:41.337
Just one for now.

00:01:41.347 --> 00:01:43.797
which contains reusable code like Zod,

00:01:43.797 --> 00:01:44.957
schema definitions,

00:01:45.177 --> 00:01:46.197
database queries,

00:01:46.597 --> 00:01:48.957
generic functions that can be used across backend

00:01:48.957 --> 00:01:50.117
services and front end services.

00:01:50.557 --> 00:01:52.997
we put all that logic inside of a package and then

00:01:52.997 --> 00:01:55.637
we can easily use it across our monorepo,

00:01:55.637 --> 00:01:57.517
the different apps inside of our monorepo.

00:01:57.867 --> 00:01:59.547
it's a little bit tedious to set up at the very

00:01:59.547 --> 00:02:00.027
beginning,

00:02:00.027 --> 00:02:02.187
which is kind of why I have this set up for you

00:02:02.267 --> 00:02:02.867
right now.

00:02:02.867 --> 00:02:06.147
But as your project grows and as it becomes more

00:02:06.147 --> 00:02:07.667
complex and you add tons of different features,

00:02:07.667 --> 00:02:10.027
this setup is really nice because you can define

00:02:10.107 --> 00:02:12.787
concepts in a very concrete way and then those

00:02:12.787 --> 00:02:14.627
concepts can scale across multiple different

00:02:14.627 --> 00:02:16.307
services inside of your application.

00:02:16.307 --> 00:02:18.507
And this pattern works so well with cloudflare.

00:02:18.507 --> 00:02:19.887
it really is a great pattern to follow.

00:02:19.967 --> 00:02:20.767
So that's,

00:02:20.767 --> 00:02:21.707
that's our setup.

00:02:21.707 --> 00:02:22.667
essentially just think

00:02:23.147 --> 00:02:25.667
multiple different applications inside of our apps

00:02:25.667 --> 00:02:27.987
folder and then we have reusable code inside of

00:02:27.987 --> 00:02:29.147
our packages folder.

00:02:29.227 --> 00:02:30.867
Now the very first thing that we're going to do is

00:02:30.867 --> 00:02:33.067
we're going to take a look at the package JSON

00:02:33.067 --> 00:02:33.547
file.

00:02:33.767 --> 00:02:35.087
we have some different scripts here.

00:02:35.167 --> 00:02:35.567
Now

00:02:36.047 --> 00:02:39.237
these scripts are using PNPM commands to basically

00:02:39.507 --> 00:02:42.987
run the dev command to dev our front end or to

00:02:42.987 --> 00:02:43.827
build our package.

00:02:43.867 --> 00:02:44.587
but to get started,

00:02:44.587 --> 00:02:46.307
the very first thing that we want to do is we're

00:02:46.307 --> 00:02:47.347
going to want to open a terminal

00:02:47.787 --> 00:02:50.427
and we're just going to say PNPM I and that's

00:02:50.427 --> 00:02:51.987
going to go ahead and it's going to install all

00:02:51.987 --> 00:02:54.667
the dependencies across our entire application.

00:02:55.317 --> 00:02:55.877
it should,

00:02:55.957 --> 00:02:57.997
it should install all the dependencies inside of

00:02:57.997 --> 00:03:00.597
the user application and the data service and our

00:03:00.597 --> 00:03:01.477
package right here.

00:03:01.717 --> 00:03:02.517
When that's done,

00:03:02.517 --> 00:03:04.037
what we're going to want to do is you're going to

00:03:04.037 --> 00:03:06.117
want to run this command I have this command which

00:03:06.117 --> 00:03:07.077
is basically saying

00:03:07.287 --> 00:03:10.407
it's going to build the source code inside of our

00:03:10.567 --> 00:03:11.727
data ops package.

00:03:11.727 --> 00:03:12.087
So

00:03:12.417 --> 00:03:14.537
inside of our data ops package here you can see

00:03:14.537 --> 00:03:16.777
that we have this R package JSON.

00:03:16.777 --> 00:03:18.337
We have a bunch of different scripts that we're

00:03:18.337 --> 00:03:19.537
going to go through later in this course.

00:03:19.537 --> 00:03:21.457
But the main one is we need to build,

00:03:21.457 --> 00:03:23.137
which is going to take the TypeScript and it's

00:03:23.137 --> 00:03:24.977
going to bundle it into JavaScript and it's going

00:03:24.977 --> 00:03:27.137
to stick it in a dist folder and it's going to

00:03:27.137 --> 00:03:29.377
make it usable across our applications.

00:03:29.537 --> 00:03:30.817
So I'm going to say

00:03:31.857 --> 00:03:32.817
pnpm

00:03:33.137 --> 00:03:33.537
run

00:03:34.097 --> 00:03:37.377
build package and this is at the root level of the

00:03:37.377 --> 00:03:39.417
mono repo that's going to go through the build

00:03:39.417 --> 00:03:39.777
process,

00:03:39.857 --> 00:03:40.847
it's going to build it,

00:03:40.847 --> 00:03:42.527
and then that code is going to be ready to go

00:03:42.527 --> 00:03:43.807
across all of our

00:03:44.577 --> 00:03:46.807
across all of our applications inside of our apps

00:03:46.807 --> 00:03:47.207
folder.

00:03:47.207 --> 00:03:49.127
So the next thing that we're going to do is we

00:03:49.127 --> 00:03:49.367
can,

00:03:49.367 --> 00:03:51.167
we're going to run our front end service.

00:03:51.407 --> 00:03:53.647
Now we can essentially what I do,

00:03:53.647 --> 00:03:55.327
what I have here is I have a few different helper

00:03:55.327 --> 00:03:56.847
scripts and we're going to extend the scripts that

00:03:56.847 --> 00:03:59.567
we put in at the root package of our mono repo.

00:03:59.567 --> 00:04:01.167
But the first one that we're going to look at is

00:04:01.637 --> 00:04:02.567
dev front end.

00:04:02.567 --> 00:04:04.567
So what this is doing is this is basically saying

00:04:04.807 --> 00:04:06.087
PNPM filter

00:04:06.457 --> 00:04:07.217
user application.

00:04:07.217 --> 00:04:09.457
So it's going to go find the user application and

00:04:09.457 --> 00:04:11.097
the user application is defined

00:04:11.497 --> 00:04:14.017
inside of the package JSON for the user

00:04:14.017 --> 00:04:14.537
application.

00:04:14.537 --> 00:04:16.457
You can see the name is user application.

00:04:16.857 --> 00:04:17.257
The

00:04:18.213 --> 00:04:20.493
and then it's going to run the dev script for

00:04:20.493 --> 00:04:20.733
that.

00:04:20.733 --> 00:04:23.253
So this is if we're running at the root level of

00:04:23.253 --> 00:04:23.573
our

00:04:24.293 --> 00:04:26.853
monorepo we can say pnpm

00:04:28.373 --> 00:04:28.773
run

00:04:29.253 --> 00:04:30.293
dev front end.

00:04:30.373 --> 00:04:31.933
And what that's going to do is that's going to

00:04:31.933 --> 00:04:33.973
start up our front end application running on

00:04:34.363 --> 00:04:35.083
Port 3000.

00:04:35.243 --> 00:04:36.923
Now another pattern,

00:04:36.923 --> 00:04:38.883
which it really just depends on how I'm building

00:04:38.883 --> 00:04:40.443
at the time is you can also

00:04:40.763 --> 00:04:41.323
CD

00:04:41.883 --> 00:04:42.283
into

00:04:42.763 --> 00:04:45.363
your application that you want to run and you can

00:04:45.363 --> 00:04:47.803
run this as like it's isolated application.

00:04:47.803 --> 00:04:48.603
So you can open

00:04:48.923 --> 00:04:51.163
user application inside of its own ide.

00:04:51.323 --> 00:04:53.203
You can forget about all of the other apps,

00:04:53.203 --> 00:04:55.163
all the other packages and you can just worry

00:04:55.163 --> 00:04:55.963
about building like

00:04:56.363 --> 00:04:58.173
one sub app at a time.

00:04:58.343 --> 00:05:00.343
and depending on what I'm working on or how I'm

00:05:00.343 --> 00:05:00.583
building,

00:05:00.583 --> 00:05:02.423
I kind of fall between both patterns.

00:05:02.423 --> 00:05:04.743
Sometimes I run the code at the root of the

00:05:04.743 --> 00:05:06.923
monorepo and then sometimes I'm really just

00:05:06.923 --> 00:05:09.243
focused on like one feature inside of the ui.

00:05:09.243 --> 00:05:11.003
And I don't want to worry about the mono repo.

00:05:11.003 --> 00:05:12.923
So we're going to bounce back and forth with this

00:05:12.923 --> 00:05:13.363
pattern.

00:05:13.423 --> 00:05:16.243
and what we're going to do is we're inside of our

00:05:16.243 --> 00:05:18.203
user application now and then we're just going to

00:05:18.203 --> 00:05:19.723
say pnpm run dev.

00:05:19.723 --> 00:05:21.563
We don't need to run that specific,

00:05:22.323 --> 00:05:23.763
we don't need to run that specific

00:05:24.403 --> 00:05:25.843
mono repo command.

00:05:26.003 --> 00:05:27.843
So we can go ahead and we can open our

00:05:28.066 --> 00:05:28.946
port 3,000.

00:05:29.149 --> 00:05:30.189
So we'll do that right here.

00:05:31.149 --> 00:05:33.829
And you can see we have this really just kind of

00:05:33.829 --> 00:05:34.989
like boilerplate ui.

00:05:34.989 --> 00:05:37.349
This is the landing page for our application.

00:05:37.349 --> 00:05:39.949
Most of the content is AI generated so don't pay

00:05:39.949 --> 00:05:40.909
too much attention to it.

00:05:40.909 --> 00:05:41.229
But

00:05:41.579 --> 00:05:43.708
this is just the marketing page and throughout

00:05:43.708 --> 00:05:45.509
this course at the very end we're going to add

00:05:45.509 --> 00:05:45.869
auth,

00:05:45.979 --> 00:05:47.069
we're going to add payments,

00:05:47.069 --> 00:05:48.509
we're going to go through that entire process.

00:05:48.589 --> 00:05:51.029
But right now this is all just kind of boilerplate

00:05:51.029 --> 00:05:53.189
hard coded stuff so we can click get started for

00:05:53.189 --> 00:05:53.469
free.

00:05:53.629 --> 00:05:54.573
What that's going to do is it's

00:05:54.739 --> 00:05:56.819
going to take us to the app page which is going to

00:05:56.819 --> 00:05:57.779
be the dashboard,

00:05:57.809 --> 00:05:58.902
that we're going to be building out.

00:05:59.135 --> 00:06:00.335
So sometimes,

00:06:00.335 --> 00:06:01.285
sometimes you get

00:06:01.288 --> 00:06:02.648
to go ahead and reload that guy.

00:06:02.882 --> 00:06:03.515
Okay,

00:06:03.515 --> 00:06:06.195
so this is the dashboard and all of this data that

00:06:06.195 --> 00:06:07.355
we have here is dummy data.

00:06:07.405 --> 00:06:09.575
but ultimately throughout this course what we're

00:06:09.575 --> 00:06:11.415
going to do is we're going to build out the data

00:06:11.415 --> 00:06:14.055
backend that's going to create all these analytics

00:06:14.055 --> 00:06:14.935
for us and then we're,

00:06:14.935 --> 00:06:17.205
we'll be able to surface them inside of our ui.

00:06:17.205 --> 00:06:18.225
we also have this,

00:06:18.225 --> 00:06:20.565
these region maps and essentially what happens is

00:06:20.565 --> 00:06:22.725
like when users click on links across the world

00:06:22.725 --> 00:06:24.445
we're going to be able to capture that data in

00:06:24.445 --> 00:06:26.285
real time and we're going to use web sockets to

00:06:26.285 --> 00:06:26.885
populate,

00:06:27.285 --> 00:06:28.925
we're going to use websockets to populate where

00:06:28.925 --> 00:06:30.925
those users are interactively on this map.

00:06:30.925 --> 00:06:33.085
So we're going to make use of like pretty cool

00:06:33.085 --> 00:06:33.975
feature in my opinion.

00:06:34.365 --> 00:06:36.365
and then just some obviously like other

00:06:36.795 --> 00:06:39.035
different analytics and different usability things

00:06:39.035 --> 00:06:40.635
inside of our application.

00:06:41.125 --> 00:06:42.705
we'll have the ability to look at links.

00:06:42.705 --> 00:06:44.185
You can obviously create a link,

00:06:44.805 --> 00:06:45.885
you can go view the links,

00:06:45.885 --> 00:06:48.285
you can edit different like routing logic for the

00:06:48.285 --> 00:06:50.165
link so you can say you want,

00:06:50.865 --> 00:06:54.425
everybody in Albania to route to a specific URL.

00:06:54.465 --> 00:06:56.345
this is all dummy data right now but we're going

00:06:56.345 --> 00:06:58.065
to be building all of this out throughout this

00:06:58.065 --> 00:06:58.345
course.

00:06:58.425 --> 00:06:58.825
So

00:06:59.144 --> 00:07:00.905
now that you have this front end working,

00:07:01.105 --> 00:07:03.265
what we're going to want to do is right off the

00:07:03.265 --> 00:07:04.425
bat we're going to want to deploy.

00:07:04.425 --> 00:07:06.985
I want us to be able to be very familiar with the

00:07:06.985 --> 00:07:07.945
cloudflare dashboard,

00:07:07.945 --> 00:07:10.215
the deployment process before we dive into,

00:07:10.605 --> 00:07:12.565
into any of the code at all because that's kind

00:07:12.565 --> 00:07:12.765
of,

00:07:12.765 --> 00:07:13.165
we're gonna,

00:07:13.165 --> 00:07:15.005
that's gonna be like the foundation for this

00:07:15.005 --> 00:07:17.085
course because we're gonna deploy so many times by

00:07:17.085 --> 00:07:17.685
the end of this course.

00:07:17.685 --> 00:07:19.725
I really hope that you have the ability to just

00:07:19.965 --> 00:07:20.325
really,

00:07:20.325 --> 00:07:22.365
really understand the deployment process because I

00:07:22.365 --> 00:07:24.105
think that's what really trips people up,

00:07:24.105 --> 00:07:25.645
when they're learning how to develop on a new

00:07:25.645 --> 00:07:27.445
platform is how do I ship my code,

00:07:27.445 --> 00:07:27.845
you know,

00:07:27.845 --> 00:07:29.565
and by the end of this course you're gonna have no

00:07:29.565 --> 00:07:30.125
issue with that,

00:07:30.125 --> 00:07:31.266
so let's go ahead and try to do that.

