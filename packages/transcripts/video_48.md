WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.114 --> 00:00:00.234
Now,

00:00:00.234 --> 00:00:01.954
for the production version of this application,

00:00:01.954 --> 00:00:04.754
I'm going to go ahead and open both wrangler files

00:00:04.754 --> 00:00:06.834
for the data service and the,

00:00:07.033 --> 00:00:07.739
and the

00:00:08.109 --> 00:00:09.229
user application.

00:00:09.389 --> 00:00:11.629
So what we can do is I'm just going to go ahead

00:00:11.629 --> 00:00:11.949
and

00:00:12.269 --> 00:00:13.709
copy the entire stage,

00:00:14.109 --> 00:00:14.959
paste it in,

00:00:14.959 --> 00:00:17.057
and then just simply rename it to

00:00:18.337 --> 00:00:18.977
production.

00:00:19.222 --> 00:00:21.382
And then we'll just work on the data service first

00:00:21.382 --> 00:00:22.662
because there's a lot more to it.

00:00:23.062 --> 00:00:25.302
Now we're just going to kind of run down and then

00:00:25.302 --> 00:00:27.462
whenever we come across something that needs a

00:00:27.542 --> 00:00:29.102
mirrored production resource,

00:00:29.102 --> 00:00:29.662
we'll do that.

00:00:29.662 --> 00:00:31.702
So the first thing is going to be our two buckets.

00:00:32.022 --> 00:00:33.222
We'll change this to

00:00:33.551 --> 00:00:34.991
production

00:00:35.488 --> 00:00:37.619
and then we can head over to Cloudflare

00:00:38.927 --> 00:00:39.014
and,

00:00:39.084 --> 00:00:41.164
and we can go to R2 and go ahead and create that

00:00:41.164 --> 00:00:41.523
guy.

00:00:41.523 --> 00:00:42.592
So create a bucket.

00:00:43.244 --> 00:00:43.908
Production.

00:00:44.468 --> 00:00:45.428
Create bucket.

00:00:45.674 --> 00:00:47.633
Now we can come down to our database and

00:00:47.633 --> 00:00:49.633
essentially we're going to want to create a

00:00:49.633 --> 00:00:52.513
production version of our database so we can come

00:00:52.513 --> 00:00:54.273
into the production version of our database.

00:00:54.439 --> 00:00:55.796
Just copy that name for now,

00:00:56.046 --> 00:00:56.470
type it out.

00:00:57.020 --> 00:00:58.900
We'll just go ahead and call this Smart Links

00:00:58.900 --> 00:00:59.500
Production.

00:00:59.900 --> 00:01:00.860
Go ahead and create.

00:01:01.133 --> 00:01:02.153
We can copy that id,

00:01:02.553 --> 00:01:03.673
head back over here,

00:01:03.753 --> 00:01:06.713
replace the production ID with our actual id

00:01:07.273 --> 00:01:09.913
and we're not going to be developing production in

00:01:09.913 --> 00:01:11.073
production locally.

00:01:11.073 --> 00:01:12.993
So I'm just going to remove the remote bindings

00:01:12.993 --> 00:01:13.433
feature,

00:01:13.633 --> 00:01:14.093
from these.

00:01:15.143 --> 00:01:17.983
We're similarly going to go create a key value

00:01:17.983 --> 00:01:19.783
pair so we can come up to KV

00:01:20.183 --> 00:01:22.583
Smart Links cache stage.

00:01:23.303 --> 00:01:24.183
So we'll say

00:01:24.983 --> 00:01:26.103
Smart Links

00:01:26.423 --> 00:01:27.143
cache

00:01:27.615 --> 00:01:28.895
and we'll call this also

00:01:30.415 --> 00:01:31.112
Production.

00:01:31.516 --> 00:01:33.663
And that's going to spit out an ID for us that we

00:01:33.663 --> 00:01:35.463
can copy and we can replace into here.

00:01:37.360 --> 00:01:38.880
we're going to have to do the same for our

00:01:39.231 --> 00:01:39.791
queue,

00:01:40.711 --> 00:01:41.531
for our queues.

00:01:41.851 --> 00:01:42.731
So we have

00:01:43.451 --> 00:01:46.491
smart links data queue and we have a dead letter

00:01:46.491 --> 00:01:46.891
queue.

00:01:46.891 --> 00:01:48.731
So we can head over to our queues

00:01:48.932 --> 00:01:50.772
and we can create a

00:01:51.854 --> 00:01:53.134
queue production.

00:01:55.210 --> 00:01:56.290
While this is creating,

00:01:56.290 --> 00:01:57.610
I'm just going to go ahead and

00:01:58.250 --> 00:01:59.130
replace that,

00:01:59.610 --> 00:02:00.890
replace that one.

00:02:03.357 --> 00:02:03.880
And then

00:02:04.280 --> 00:02:06.040
we can replace this right here.

00:02:06.269 --> 00:02:09.697
and then we also have a smart links dead letter

00:02:09.697 --> 00:02:10.529
queue as well.

00:02:10.689 --> 00:02:12.314
So we can create the dead letter

00:02:14.033 --> 00:02:16.566
and our dead letter Q for production.

00:02:16.566 --> 00:02:18.606
We're going to want to mirror it and we can just

00:02:18.606 --> 00:02:20.566
go ahead and we can turn off our,

00:02:20.812 --> 00:02:21.400
consumption.

00:02:21.400 --> 00:02:22.646
So it should be under messages.

00:02:22.646 --> 00:02:23.046
Actually,

00:02:23.446 --> 00:02:25.126
status is going to be paused

00:02:26.086 --> 00:02:27.606
so we can come back into here,

00:02:27.846 --> 00:02:30.366
make sure that where we're using dead letter queue

00:02:30.366 --> 00:02:31.126
for production

00:02:31.606 --> 00:02:32.886
is just going to be called

00:02:33.365 --> 00:02:34.406
production as well.

00:02:35.875 --> 00:02:38.275
And then let's go take a look at our

00:02:38.595 --> 00:02:39.315
workflow.

00:02:39.315 --> 00:02:41.635
So from the durable objects and workflows

00:02:41.635 --> 00:02:42.195
perspective,

00:02:42.755 --> 00:02:44.995
it actually is going to be a little bit easier,

00:02:44.995 --> 00:02:45.475
I think.

00:02:45.635 --> 00:02:46.035
So.

00:02:46.825 --> 00:02:49.225
I do suspect when we deploy this,

00:02:49.765 --> 00:02:52.005
when we deploy this data service project,

00:02:52.565 --> 00:02:55.765
those workflows should actually get a new name,

00:02:55.845 --> 00:02:56.645
I would suspect.

00:02:56.645 --> 00:02:58.822
So let's go ahead and look at our stage workflows.

00:02:58.822 --> 00:02:59.084
Yeah,

00:02:59.084 --> 00:03:01.204
so we actually might want to just come into here

00:03:01.444 --> 00:03:03.684
and give our workflow

00:03:04.283 --> 00:03:04.523
name.

00:03:04.603 --> 00:03:05.803
We'll call this also

00:03:07.403 --> 00:03:08.105
Production.

00:03:08.105 --> 00:03:09.988
Now that should be good

00:03:10.308 --> 00:03:10.948
from the

00:03:11.268 --> 00:03:12.868
production pipeline perspective.

00:03:13.188 --> 00:03:15.588
we're going to do one manual deploy to production

00:03:15.588 --> 00:03:17.227
just to make sure everything's working as

00:03:17.227 --> 00:03:17.508
expected.

00:03:17.828 --> 00:03:19.988
So I'm going to go ahead and add

00:03:21.328 --> 00:03:22.848
a production deploy here

00:03:28.600 --> 00:03:30.760
and we'll just call this production

00:03:34.280 --> 00:03:36.360
CD into our apps

00:03:36.760 --> 00:03:38.840
data service PMPM run.

00:03:43.953 --> 00:03:45.633
So that deployment went through as expected.

00:03:46.193 --> 00:03:49.633
Let's also head over to our wrangler JSON C for

00:03:49.873 --> 00:03:50.273
our

00:03:51.263 --> 00:03:52.303
user application.

00:03:52.703 --> 00:03:54.303
This one's going to be a little bit lighter

00:03:54.303 --> 00:03:54.703
weight,

00:03:54.943 --> 00:03:57.423
so I'm just going to go ahead and copy this guy

00:03:57.503 --> 00:03:57.903
again.

00:03:59.263 --> 00:04:00.383
Instead of stage,

00:04:00.383 --> 00:04:01.423
we will call this

00:04:04.623 --> 00:04:05.299
production

00:04:05.734 --> 00:04:05.974
our

00:04:06.454 --> 00:04:07.254
database.

00:04:07.414 --> 00:04:11.094
We can actually grab that D1 database ID from our

00:04:11.094 --> 00:04:12.134
production side.

00:04:12.294 --> 00:04:12.694
So

00:04:14.004 --> 00:04:16.004
we got this good right here.

00:04:16.478 --> 00:04:18.094
We can go ahead and put that into here.

00:04:18.894 --> 00:04:21.534
And then we're also going to want to change our

00:04:21.694 --> 00:04:22.898
production flag here.

00:04:26.854 --> 00:04:28.454
Going to CD into user application.

00:04:32.277 --> 00:04:32.997
Okay,

00:04:33.077 --> 00:04:35.397
so to get this to also work into production,

00:04:35.397 --> 00:04:37.477
let's take a look at

00:04:37.637 --> 00:04:38.517
the package JSON.

00:04:38.517 --> 00:04:39.917
A few different things we're going to have to do

00:04:39.917 --> 00:04:40.157
here.

00:04:40.157 --> 00:04:41.957
What we are first going to want to do is we're

00:04:41.957 --> 00:04:43.637
going to want to specify a build script

00:04:44.197 --> 00:04:45.477
specifically for

00:04:46.417 --> 00:04:47.917
specifically for production.

00:04:48.207 --> 00:04:49.567
And what's going to happen is we're going to say

00:04:49.567 --> 00:04:51.367
vite build and we're going to pass in a mode

00:04:51.367 --> 00:04:51.967
production.

00:04:51.967 --> 00:04:53.007
Now because we're using vite,

00:04:53.007 --> 00:04:54.527
it's going to be slightly different than the other

00:04:54.527 --> 00:04:54.847
environment,

00:04:54.927 --> 00:04:57.207
which is kind of why I wanted to have this project

00:04:57.207 --> 00:05:00.127
set up to use both vite and a normal wrangler

00:05:00.127 --> 00:05:00.847
configuration.

00:05:01.957 --> 00:05:02.317
yeah,

00:05:02.317 --> 00:05:03.837
so we have this build script which builds with

00:05:03.837 --> 00:05:04.517
mode production.

00:05:04.517 --> 00:05:05.557
Then it runs ts.

00:05:05.637 --> 00:05:07.757
Now what we're going to do is we're also going to

00:05:07.757 --> 00:05:08.117
say

00:05:09.487 --> 00:05:12.647
we're going to basically say deploy Production.

00:05:12.647 --> 00:05:13.087
Deploy

00:05:14.197 --> 00:05:15.157
is going to run

00:05:16.597 --> 00:05:19.637
production colon build and then call wrangler

00:05:19.637 --> 00:05:20.197
deploy.

00:05:20.437 --> 00:05:21.797
Now that's one of the things.

00:05:21.797 --> 00:05:22.837
Another thing that I noticed,

00:05:22.837 --> 00:05:24.117
if you're following along typing,

00:05:24.117 --> 00:05:26.117
I actually had a typo here in this environment.

00:05:26.357 --> 00:05:27.397
So just make sure that

00:05:27.717 --> 00:05:30.037
this is spelled production correctly.

00:05:30.597 --> 00:05:30.997
And

00:05:31.817 --> 00:05:34.177
the last thing we have to do is basically we have

00:05:34.177 --> 00:05:35.177
to take our

00:05:36.457 --> 00:05:38.457
EMV file and create a new one called

00:05:39.037 --> 00:05:40.477
EMV dot production

00:05:40.797 --> 00:05:43.277
and then we can pass in our cloudflare EMV

00:05:43.437 --> 00:05:46.717
production here and then also we can have our

00:05:46.797 --> 00:05:48.077
production host

00:05:48.477 --> 00:05:49.117
as well.

00:05:49.117 --> 00:05:51.757
So from here if we say pnpm run,

00:05:53.067 --> 00:05:53.787
production

00:05:54.187 --> 00:05:54.906
deploy.

00:05:55.467 --> 00:05:56.780
Just going to deploy this one time

00:05:57.182 --> 00:05:58.062
now that went through.

00:05:58.142 --> 00:06:00.382
We can go ahead and open this guy up,

00:06:00.622 --> 00:06:01.342
take a look,

00:06:01.422 --> 00:06:03.022
make sure everything's working as expected.

00:06:03.182 --> 00:06:04.382
So this deployed,

00:06:05.022 --> 00:06:05.102
we

00:06:05.162 --> 00:06:06.242
can head over to app.

00:06:06.502 --> 00:06:08.642
looks like something actually went wrong here.

00:06:08.642 --> 00:06:09.602
Let's take a look.

00:06:09.682 --> 00:06:10.202
Oh yes,

00:06:10.202 --> 00:06:11.922
this is actually something I did want to get to.

00:06:11.922 --> 00:06:12.322
So

00:06:12.642 --> 00:06:14.282
we created our D1 database,

00:06:14.282 --> 00:06:15.122
a brand new one,

00:06:15.122 --> 00:06:16.482
but we don't have any tables yet.

00:06:16.562 --> 00:06:18.642
So no doubt this doesn't work.

00:06:19.322 --> 00:06:21.282
So what we want to do is we're basically going to

00:06:21.282 --> 00:06:23.362
want to recreate those exact same tables that we

00:06:23.362 --> 00:06:23.642
have.

00:06:24.202 --> 00:06:24.602
And

00:06:25.422 --> 00:06:26.622
I know we have,

00:06:26.622 --> 00:06:27.302
we have the

00:06:27.302 --> 00:06:28.896
SQL statements in our code like

00:06:28.896 --> 00:06:31.109
up further when we actually created that where we

00:06:31.109 --> 00:06:31.949
created the tables.

00:06:31.949 --> 00:06:32.309
But

00:06:32.629 --> 00:06:34.309
I want to show you something that's pretty cool

00:06:34.309 --> 00:06:35.349
that you can do with Drizzle.

00:06:35.349 --> 00:06:36.949
So let's head over to

00:06:39.429 --> 00:06:40.549
our packages,

00:06:40.629 --> 00:06:43.269
application or packages and then headed to Data

00:06:43.269 --> 00:06:43.829
Ops.

00:06:45.329 --> 00:06:46.929
Now inside of Data Ops,

00:06:46.938 --> 00:06:50.405
inside of Data Ops we have a Drizzle configuration

00:06:50.405 --> 00:06:52.725
that is configured for our D1 database.

00:06:53.125 --> 00:06:55.605
Now we also have a

00:06:57.080 --> 00:06:58.964
we also have our Drizzle out

00:06:59.364 --> 00:07:01.204
which has these SQL statements.

00:07:01.604 --> 00:07:03.564
Now what I'm going to do is I'm just going to go

00:07:03.564 --> 00:07:04.084
ahead and

00:07:04.404 --> 00:07:05.044
delete.

00:07:05.243 --> 00:07:06.923
I think we can go ahead and delete this entire

00:07:06.923 --> 00:07:07.243
thing

00:07:08.330 --> 00:07:09.770
and then we're just going to do this one more time

00:07:09.770 --> 00:07:11.290
again saying pnpm run

00:07:11.610 --> 00:07:12.170
poll

00:07:12.570 --> 00:07:14.970
and that's going to call our pull Drizzle poll

00:07:14.970 --> 00:07:15.370
script

00:07:15.690 --> 00:07:17.010
and then it's going to output this.

00:07:17.010 --> 00:07:19.370
So it's going to give us a fresh copy of our

00:07:19.770 --> 00:07:22.570
SQL DDL so our create statements and whatnot.

00:07:22.570 --> 00:07:22.890
So

00:07:23.210 --> 00:07:23.810
we can.

00:07:23.810 --> 00:07:24.130
Oh,

00:07:24.130 --> 00:07:25.450
I'm in the wrong application here.

00:07:25.450 --> 00:07:27.370
So we can head back over to Drizzle out,

00:07:28.060 --> 00:07:29.420
take a look at what we have here.

00:07:29.900 --> 00:07:31.226
So we have these queries.

00:07:31.434 --> 00:07:32.862
So let's copy these guys over

00:07:33.323 --> 00:07:35.902
and let's hope that this format works for us.

00:07:35.902 --> 00:07:37.462
But we can go over to our

00:07:38.162 --> 00:07:38.801
worker.

00:07:39.222 --> 00:07:39.402
no,

00:07:39.402 --> 00:07:41.002
I'll go over to Storage and databases,

00:07:41.242 --> 00:07:42.202
head to our

00:07:42.682 --> 00:07:43.802
production instance.

00:07:43.944 --> 00:07:44.174
No,

00:07:44.254 --> 00:07:45.094
wrong guy here.

00:07:45.094 --> 00:07:46.414
I went to KV SQL

00:07:46.734 --> 00:07:48.444
head over to our Smart Links production.

00:07:48.444 --> 00:07:50.258
We can go ahead and explore data.

00:07:50.418 --> 00:07:52.498
We'll paste these guys in there and hit run.

00:07:52.560 --> 00:07:55.040
Looks like it's having a hard time creating this

00:07:55.280 --> 00:07:55.920
index.

00:07:56.143 --> 00:07:56.407
Oh,

00:07:56.407 --> 00:07:58.207
I think I know exactly what's happening here.

00:07:58.207 --> 00:08:00.927
So we are just going to want to start one by one.

00:08:01.087 --> 00:08:02.367
So let's run this guy,

00:08:03.043 --> 00:08:04.120
let's run this guy.

00:08:04.614 --> 00:08:05.414
Run this guy.

00:08:05.478 --> 00:08:06.346
And then finally,

00:08:06.346 --> 00:08:07.626
let's run this last one.

00:08:08.666 --> 00:08:09.266
Got it.

00:08:09.266 --> 00:08:09.706
Okay,

00:08:09.706 --> 00:08:10.866
so now our tables are working.

00:08:10.866 --> 00:08:12.906
Let's head back over to our production ui,

00:08:13.466 --> 00:08:14.226
reload this.

00:08:14.226 --> 00:08:16.586
And everything is working as expected once again,

00:08:16.586 --> 00:08:17.546
which is awesome.

00:08:17.626 --> 00:08:18.026
So,

00:08:18.266 --> 00:08:18.786
yep.

00:08:18.786 --> 00:08:20.666
So our websockets are connected.

00:08:20.906 --> 00:08:23.146
We're able to successfully pull data.

00:08:23.526 --> 00:08:25.206
and this is still dummy data.

00:08:25.206 --> 00:08:26.006
Towards the end of the course,

00:08:26.006 --> 00:08:27.366
we'll actually fill out the rest of this.

00:08:27.366 --> 00:08:27.686
But

00:08:28.086 --> 00:08:30.526
now we have successfully created a production

00:08:30.526 --> 00:08:30.806
environment

00:08:31.346 --> 00:08:33.706
and a stage environment so we can develop on stage

00:08:33.706 --> 00:08:35.506
and then we can deploy to production.

00:08:36.326 --> 00:08:38.126
what we're going to do is we're going to set up

00:08:38.126 --> 00:08:38.486
our,

00:08:38.686 --> 00:08:40.086
CI CD pipelines.

00:08:40.406 --> 00:08:43.326
So we're going to set up our automated builds that

00:08:43.326 --> 00:08:44.406
are going to be triggered from,

00:08:44.486 --> 00:08:45.466
GitHub pushes.

00:08:45.546 --> 00:08:46.686
So let's go ahead and do that.

