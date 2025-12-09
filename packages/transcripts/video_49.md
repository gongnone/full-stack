WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.076 --> 00:00:00.436
All right,

00:00:00.436 --> 00:00:02.636
so now to create automated deploys,

00:00:02.716 --> 00:00:05.756
let's go ahead and start with our user application

00:00:05.756 --> 00:00:06.316
stage.

00:00:06.380 --> 00:00:09.246
We can head over to Settings and there's a section

00:00:09.246 --> 00:00:09.846
called Build,

00:00:09.846 --> 00:00:11.248
which is currently in beta.

00:00:11.613 --> 00:00:13.253
You're going to want to go ahead and connect your

00:00:13.253 --> 00:00:13.967
GitHub repo.

00:00:14.366 --> 00:00:16.486
So this is going to give you an overview as to

00:00:16.486 --> 00:00:19.246
what Cloudflare is able to do and has access to.

00:00:19.406 --> 00:00:19.806
Now,

00:00:20.786 --> 00:00:21.986
there's two things you can do.

00:00:21.986 --> 00:00:23.906
You can give it access to all repositories,

00:00:23.906 --> 00:00:26.786
or you can do it just select repositories.

00:00:26.866 --> 00:00:27.266
So

00:00:27.666 --> 00:00:30.426
for this purpose I'm just going to go ahead and

00:00:30.426 --> 00:00:32.226
say specifically the

00:00:32.536 --> 00:00:34.256
repository that we are working in,

00:00:34.256 --> 00:00:36.216
which is called Full Stack on Cloudflare.

00:00:38.102 --> 00:00:39.736
From here we can go ahead and save.

00:00:39.842 --> 00:00:40.473
All right,

00:00:40.633 --> 00:00:42.473
now what we're going to do is we're going to allow

00:00:42.473 --> 00:00:43.803
it to act on our behalf

00:00:43.803 --> 00:00:45.154
and then you're going to be taken to this

00:00:45.154 --> 00:00:46.852
configuration on this side right here.

00:00:46.852 --> 00:00:48.278
So there's a few different things that we care

00:00:48.278 --> 00:00:48.918
about here.

00:00:48.918 --> 00:00:50.878
And because we're working in a mono repo,

00:00:50.878 --> 00:00:52.878
this configuration is going to be a little bit

00:00:52.878 --> 00:00:54.838
different from what you are seeing in the

00:00:54.838 --> 00:00:56.118
Cloudflare documentation.

00:00:56.278 --> 00:00:56.678
So,

00:00:56.968 --> 00:00:59.098
basically what it's asking is it wants us to look

00:00:59.098 --> 00:01:00.338
for a specific branch

00:01:00.818 --> 00:01:03.058
and then it also wants us to

00:01:03.548 --> 00:01:04.598
provide a build command,

00:01:04.598 --> 00:01:06.038
which it does this by default,

00:01:06.038 --> 00:01:07.908
but we're actually going to end up changing that

00:01:08.058 --> 00:01:08.134
that.

00:01:08.227 --> 00:01:08.627
Now,

00:01:08.677 --> 00:01:11.147
this type of git configuration doesn't give us

00:01:11.147 --> 00:01:13.027
like a ton of flexibility,

00:01:13.187 --> 00:01:14.627
but it does give us enough.

00:01:15.347 --> 00:01:15.747
So,

00:01:16.307 --> 00:01:17.587
it's going to work for this use case.

00:01:17.587 --> 00:01:18.867
But just know if you want to get,

00:01:18.867 --> 00:01:20.426
do something like incredibly custom,

00:01:20.426 --> 00:01:21.307
you could always create GitHub,

00:01:21.367 --> 00:01:23.287
actions and you could pass in cloud flares,

00:01:23.287 --> 00:01:25.887
API keys to authenticate and do builds that way.

00:01:25.887 --> 00:01:27.687
But what we're going to do is I'm actually just

00:01:27.687 --> 00:01:28.527
going to cancel this

00:01:29.197 --> 00:01:31.844
and I want to head back over to our code base

00:01:31.844 --> 00:01:33.862
and what we're going to do is we're actually going

00:01:33.862 --> 00:01:35.302
to CD back to the root

00:01:39.782 --> 00:01:42.102
and then I'm going to create a branch that.

00:01:42.422 --> 00:01:43.662
So if you look at this,

00:01:43.662 --> 00:01:44.262
we have

00:01:46.757 --> 00:01:47.397
to get

00:01:48.277 --> 00:01:48.917
branch.

00:01:49.477 --> 00:01:50.677
So we currently have

00:01:51.497 --> 00:01:53.657
I'm going to go ahead and create a branch called

00:01:54.387 --> 00:01:54.587
dev.

00:01:54.587 --> 00:01:55.427
So I'm going to say

00:01:55.987 --> 00:02:00.027
git checkout dash B which creates the branch and

00:02:00.027 --> 00:02:00.867
we're going to call this,

00:02:01.427 --> 00:02:03.147
actually we'll call this stage to keep things

00:02:03.147 --> 00:02:03.827
consistent.

00:02:04.147 --> 00:02:05.827
So now we are devving on stage.

00:02:05.907 --> 00:02:08.227
So essentially what we can do is we can have,

00:02:08.307 --> 00:02:11.187
we can say whenever we merge into a branch called

00:02:11.187 --> 00:02:11.667
Stage.

00:02:11.987 --> 00:02:13.907
It's going to trigger that stage build and then

00:02:13.907 --> 00:02:16.227
when we merge those changes from Stage into our

00:02:16.227 --> 00:02:18.307
main branch and that's going to do the production

00:02:18.307 --> 00:02:18.627
build.

00:02:18.707 --> 00:02:21.587
So we can head back over to our cloudflare,

00:02:21.837 --> 00:02:22.077
project.

00:02:22.717 --> 00:02:24.517
I'm just going to make sure we're in the right

00:02:24.517 --> 00:02:24.757
thing.

00:02:24.757 --> 00:02:27.117
User application stage is what I'm going to care

00:02:27.117 --> 00:02:27.357
about.

00:02:27.357 --> 00:02:28.877
First we'll head over to Settings.

00:02:29.567 --> 00:02:30.517
we can say

00:02:31.557 --> 00:02:32.357
builds

00:02:32.392 --> 00:02:32.956
Connect.

00:02:33.021 --> 00:02:34.541
We're going to look at this

00:02:34.861 --> 00:02:35.741
repository.

00:02:36.301 --> 00:02:37.501
We are going to

00:02:37.821 --> 00:02:39.942
see if it can't pull in the new ones.

00:02:39.942 --> 00:02:41.310
I might have to push some changes.

00:02:41.310 --> 00:02:42.870
I'm just going to go to a readme

00:02:44.460 --> 00:02:45.580
and I'm going to add some

00:02:45.980 --> 00:02:46.620
stuff here.

00:03:04.125 --> 00:03:04.525
All right,

00:03:04.525 --> 00:03:07.165
so now we have our stage branch pop up right here.

00:03:07.325 --> 00:03:09.725
So I'm going to go ahead and select Stage branch.

00:03:09.725 --> 00:03:12.525
And then what we can do is we can look at our,

00:03:13.175 --> 00:03:14.215
we can look at our

00:03:14.565 --> 00:03:17.765
package JSON at the very root of our application.

00:03:17.776 --> 00:03:19.553
And you're going to notice that I have a few

00:03:19.553 --> 00:03:20.953
things already defined here,

00:03:20.973 --> 00:03:23.433
that we went over at the beginning of the course.

00:03:23.673 --> 00:03:25.712
Now these things are going to change slightly.

00:03:25.712 --> 00:03:27.593
So what we're going to want to do is we're going

00:03:27.593 --> 00:03:28.233
to want to say,

00:03:29.043 --> 00:03:29.603
stage

00:03:30.083 --> 00:03:31.083
build package.

00:03:31.083 --> 00:03:31.443
Actually,

00:03:31.523 --> 00:03:32.603
we don't need to do that.

00:03:32.603 --> 00:03:33.923
That can just be build package.

00:03:33.923 --> 00:03:36.603
Now we're going to add a few additional scripts.

00:03:36.603 --> 00:03:39.683
We're going to first add a script to build our

00:03:39.683 --> 00:03:40.483
user applic

00:03:41.023 --> 00:03:41.983
for the stage.

00:03:41.998 --> 00:03:45.502
So we will be adding a stage dot deploy or stage

00:03:45.502 --> 00:03:47.502
colon deploy front end.

00:03:47.502 --> 00:03:49.182
And what that's going to do is it's going to say

00:03:49.342 --> 00:03:51.022
pnpm run build package,

00:03:51.022 --> 00:03:52.342
which runs this command.

00:03:52.342 --> 00:03:54.142
So it builds our data ops,

00:03:54.302 --> 00:03:56.222
our queries and whatnot.

00:03:56.222 --> 00:03:59.342
And then we say and PNPM filter find the user

00:03:59.342 --> 00:03:59.862
application.

00:03:59.862 --> 00:04:00.862
And then it's going to run

00:04:01.342 --> 00:04:02.702
stage deploy.

00:04:03.102 --> 00:04:04.702
So I'm going to go ahead.

00:04:04.782 --> 00:04:05.982
So right now we are on

00:04:06.302 --> 00:04:07.342
our dev branch,

00:04:07.742 --> 00:04:08.302
which is good.

00:04:08.382 --> 00:04:10.702
So I'm going to go ahead and add these changes.

00:04:20.455 --> 00:04:21.815
I'm going to go ahead and push them.

00:04:27.082 --> 00:04:27.722
Okay,

00:04:27.802 --> 00:04:28.202
so

00:04:28.682 --> 00:04:30.242
now that that is done,

00:04:30.242 --> 00:04:31.682
these changes are pushed.

00:04:31.682 --> 00:04:32.322
I'm going to hit.

00:04:32.322 --> 00:04:34.014
I'm going to grab this command right here

00:04:34.150 --> 00:04:36.910
and then it's going to give us the option to

00:04:36.910 --> 00:04:37.910
provide a,

00:04:38.320 --> 00:04:38.510
to

00:04:38.990 --> 00:04:39.870
provide a

00:04:39.962 --> 00:04:41.022
deploy command.

00:04:41.022 --> 00:04:42.832
So we should be able to say

00:04:43.722 --> 00:04:45.242
pmpm run

00:04:46.042 --> 00:04:47.882
stage front end deploy.

00:04:48.042 --> 00:04:48.336
So

00:04:48.602 --> 00:04:49.322
let's just.

00:04:50.711 --> 00:04:51.111
All right,

00:04:51.111 --> 00:04:52.951
so let's just make sure everything here is good.

00:04:53.104 --> 00:04:55.254
I hope PNPM actually works with this.

00:04:55.494 --> 00:04:57.174
Now make sure we have all here.

00:04:57.174 --> 00:04:58.171
Let's go ahead and connect.

00:04:58.171 --> 00:04:58.588
All right,

00:04:58.588 --> 00:05:01.068
so now we have this build so we can head over to

00:05:01.068 --> 00:05:03.108
deployments and head back to our code base.

00:05:03.458 --> 00:05:05.178
I'm just going to go modify the readme a little

00:05:05.178 --> 00:05:06.738
bit again and I'm going to

00:05:07.058 --> 00:05:07.698
say git,

00:05:07.698 --> 00:05:08.018
add,

00:05:08.098 --> 00:05:08.578
git

00:05:08.978 --> 00:05:09.618
commit

00:05:10.338 --> 00:05:10.738
change,

00:05:13.138 --> 00:05:13.858
read me,

00:05:14.658 --> 00:05:15.058
get

00:05:16.578 --> 00:05:17.058
push

00:05:18.418 --> 00:05:19.218
origin

00:05:19.938 --> 00:05:20.498
stage.

00:05:21.298 --> 00:05:22.498
So that gets pushed.

00:05:22.578 --> 00:05:24.898
Now we should see an attempt

00:05:25.218 --> 00:05:25.618
of

00:05:25.938 --> 00:05:26.058
a,

00:05:26.058 --> 00:05:27.078
deploy come through

00:05:27.478 --> 00:05:28.118
right here.

00:05:28.330 --> 00:05:28.610
All right,

00:05:28.610 --> 00:05:29.170
so look at that.

00:05:29.170 --> 00:05:30.490
A build is in progress.

00:05:30.490 --> 00:05:33.330
So that was automatically picked up when we pushed

00:05:33.330 --> 00:05:34.570
our changes to stage.

00:05:34.572 --> 00:05:36.515
But it does look like we had a fail.

00:05:36.595 --> 00:05:38.038
And why is it failing?

00:05:38.039 --> 00:05:40.639
So it looks like we're failing with an issue

00:05:40.639 --> 00:05:42.119
saying there's no node modules.

00:05:42.269 --> 00:05:44.349
so I do think we need to add the installation

00:05:44.349 --> 00:05:44.869
script.

00:05:44.869 --> 00:05:47.189
So I'm just going to go ahead and play around with

00:05:47.189 --> 00:05:48.949
this just to make sure everything's going to work

00:05:48.949 --> 00:05:49.389
as expected.

00:05:50.189 --> 00:05:52.669
So we should be able to say PNPM I

00:05:53.849 --> 00:05:56.289
which is going to install and then P and then pnpm

00:05:56.289 --> 00:05:58.849
run build and then PNPM filter.

00:05:58.849 --> 00:06:00.169
So that should be able to install everything

00:06:00.169 --> 00:06:01.329
inside of the mono repo.

00:06:01.329 --> 00:06:01.849
Let's just.

00:06:02.249 --> 00:06:04.089
I hope this works.

00:06:04.239 --> 00:06:06.479
a lot of times when you're doing these types of

00:06:06.479 --> 00:06:07.119
DevOps stuff,

00:06:07.119 --> 00:06:08.199
setups for the first time,

00:06:08.199 --> 00:06:09.879
you're going to want to like kind of iterate and

00:06:09.879 --> 00:06:10.559
play around with it.

00:06:10.559 --> 00:06:12.559
But I am glad we're able to see some failures.

00:06:12.559 --> 00:06:13.559
So you know,

00:06:13.559 --> 00:06:15.359
we can illustrate how to debug this.

00:06:15.439 --> 00:06:17.099
I do think that that's actually pretty useful.

00:06:17.739 --> 00:06:19.339
So let's go ahead and push that to stage

00:06:20.449 --> 00:06:20.689
and

00:06:21.169 --> 00:06:23.569
we should see another build over here

00:06:23.648 --> 00:06:24.410
get picked up.

00:06:24.676 --> 00:06:25.956
We can view this build.

00:06:26.163 --> 00:06:27.453
So it's going through cloning,

00:06:27.453 --> 00:06:28.333
repository,

00:06:29.047 --> 00:06:29.921
installing

00:06:30.321 --> 00:06:31.921
tools and dependencies.

00:06:32.081 --> 00:06:35.281
It's going through cloudflare's global Edge

00:06:35.281 --> 00:06:35.601
network.

00:06:35.798 --> 00:06:36.198
look at that.

00:06:36.198 --> 00:06:37.838
We're installing our dependencies.

00:06:38.284 --> 00:06:40.204
The node modules are resolving

00:06:40.863 --> 00:06:40.883
and

00:06:41.063 --> 00:06:42.823
we did get one more error.

00:06:42.823 --> 00:06:44.943
This error looks to be kind of another thing

00:06:44.943 --> 00:06:45.623
that's specific.

00:06:45.623 --> 00:06:46.503
It looks like it says

00:06:47.003 --> 00:06:47.723
typescript.

00:06:48.113 --> 00:06:49.343
TSC is not found.

00:06:49.423 --> 00:06:51.303
So this command that we're actually running,

00:06:51.303 --> 00:06:52.543
it looks like it isn't

00:06:52.913 --> 00:06:53.683
installed

00:06:54.163 --> 00:06:56.083
on their build time dependency.

00:06:56.243 --> 00:06:58.523
I think I have it installed globally which is why

00:06:58.523 --> 00:06:59.683
this is working for me.

00:06:59.683 --> 00:07:02.483
So I'm going to go ahead and add that to

00:07:03.013 --> 00:07:03.983
package JSON.

00:07:03.983 --> 00:07:04.942
So at the root

00:07:04.942 --> 00:07:06.446
we're going to add TSC.

00:07:07.886 --> 00:07:11.726
So we should be able to say PNPM add TypeScript

00:07:11.976 --> 00:07:13.256
with a dev dependency.

00:07:13.256 --> 00:07:15.416
And this is one caveat when working in a

00:07:15.736 --> 00:07:16.376
workspace,

00:07:16.376 --> 00:07:17.368
a PNPM workspace.

00:07:17.368 --> 00:07:20.012
It wants you to specify a flag called

00:07:20.572 --> 00:07:21.732
workspace root,

00:07:21.732 --> 00:07:23.612
just so it knows that like,

00:07:23.692 --> 00:07:26.092
so you know that you're installing a dependency at

00:07:26.092 --> 00:07:27.932
the root and it's actually not inside of these

00:07:27.932 --> 00:07:28.492
modules.

00:07:28.492 --> 00:07:30.212
So let's see if this works.

00:07:30.212 --> 00:07:31.132
I'm going to go ahead and

00:07:31.612 --> 00:07:32.012
add.

00:07:32.252 --> 00:07:33.452
I'm going to go ahead and

00:07:34.081 --> 00:07:34.561
push,

00:07:34.881 --> 00:07:36.881
push these changes one last time

00:07:37.511 --> 00:07:38.641
or hopefully one last time

00:07:38.678 --> 00:07:39.998
and head back over here.

00:07:39.998 --> 00:07:41.078
Let's look at this build.

00:07:41.558 --> 00:07:43.958
A build should be picked up right now.

00:07:44.558 --> 00:07:44.958
And

00:07:45.438 --> 00:07:47.318
I'm just going to go ahead and pause until we get

00:07:47.318 --> 00:07:47.858
to the end of this.

00:07:47.858 --> 00:07:49.460
And it looks like that did the trick.

00:07:49.460 --> 00:07:51.820
So we have successfully built and deployed

00:07:52.140 --> 00:07:54.060
from deploying to our stage,

00:07:54.220 --> 00:07:54.460
branch,

00:07:54.460 --> 00:07:55.300
which is pretty cool.

00:07:55.700 --> 00:07:58.660
So let's go mirror the same thing for our

00:07:59.510 --> 00:08:01.110
for our production version of it.

00:08:01.110 --> 00:08:03.030
Let's also add a production script into here

00:08:06.576 --> 00:08:08.096
and we're going to call this

00:08:09.296 --> 00:08:10.096
production

00:08:10.160 --> 00:08:10.702
deploy.

00:08:10.815 --> 00:08:12.375
it's going to do the similar thing.

00:08:12.375 --> 00:08:13.975
It's just going to run the

00:08:15.680 --> 00:08:16.400
production,

00:08:16.500 --> 00:08:17.100
specific

00:08:17.186 --> 00:08:18.187
deploy command.

00:08:18.427 --> 00:08:18.827
Now

00:08:18.988 --> 00:08:20.288
we can go ahead and copy this guy.

00:08:20.288 --> 00:08:22.627
I'm going to make sure that this is in our code

00:08:22.627 --> 00:08:23.027
base.

00:08:23.027 --> 00:08:23.907
So we can say

00:08:27.747 --> 00:08:28.147
added

00:08:28.707 --> 00:08:29.107
prod

00:08:29.907 --> 00:08:30.307
build

00:08:31.321 --> 00:08:32.796
pnpm run

00:08:34.236 --> 00:08:36.236
push origin stage.

00:08:36.636 --> 00:08:36.996
Sorry,

00:08:36.996 --> 00:08:37.714
not pnpm

00:08:38.352 --> 00:08:38.832
git

00:08:40.422 --> 00:08:41.462
push origin stage.

00:08:42.342 --> 00:08:42.862
Okay,

00:08:42.862 --> 00:08:45.502
let's head back over to our settings in our user

00:08:45.502 --> 00:08:46.022
application

00:08:46.582 --> 00:08:48.902
and then come over to our

00:08:50.306 --> 00:08:51.707
we'll head over to our

00:08:52.107 --> 00:08:54.027
production version of the user application,

00:08:54.027 --> 00:08:54.916
head over to settings,

00:08:55.316 --> 00:08:56.452
we can go to builds

00:08:56.452 --> 00:08:57.475
and we can connect,

00:08:57.625 --> 00:08:59.147
we can connect this application

00:08:59.147 --> 00:09:01.991
and this is going to trigger when we deploy to the

00:09:01.991 --> 00:09:02.751
main branch.

00:09:02.991 --> 00:09:03.391
So

00:09:04.161 --> 00:09:06.001
I'm going to go ahead and add

00:09:06.574 --> 00:09:07.454
PMPM

00:09:09.854 --> 00:09:10.254
run

00:09:10.974 --> 00:09:13.054
production deploy front end.

00:09:13.054 --> 00:09:14.654
So that's going to trigger our production.

00:09:15.134 --> 00:09:17.214
And let's just make sure that this is for.

00:09:17.934 --> 00:09:20.654
This is only going to be for production branches

00:09:20.924 --> 00:09:22.989
and everything else should be the same.

00:09:23.549 --> 00:09:24.749
So we connect this.

00:09:24.944 --> 00:09:27.114
I'm going to go to deployments here and then

00:09:27.994 --> 00:09:29.594
we can open up GitHub.

00:09:29.914 --> 00:09:32.354
I'm going to open up GitHub and go to my own

00:09:32.354 --> 00:09:33.594
personal GitHub account

00:09:35.354 --> 00:09:35.754
and

00:09:36.154 --> 00:09:37.311
come to this repo

00:09:37.598 --> 00:09:40.198
and then we are going to go ahead and compare and

00:09:40.198 --> 00:09:40.638
pull.

00:09:41.118 --> 00:09:43.638
So I'm going to make sure that this gets merged

00:09:43.638 --> 00:09:44.718
into the right

00:09:45.358 --> 00:09:46.158
main branch.

00:09:46.318 --> 00:09:48.638
So this is going to go from stage to main.

00:09:49.528 --> 00:09:50.168
Open this pr

00:09:51.698 --> 00:09:53.218
now we can see that

00:09:53.618 --> 00:09:54.338
we have

00:09:54.758 --> 00:09:55.223
All right,

00:09:55.223 --> 00:09:57.183
so right now the stage one is still building.

00:09:57.263 --> 00:09:58.983
So this is a cool thing that gets injected.

00:09:58.983 --> 00:10:00.723
Basically it's going to wait for this

00:10:00.723 --> 00:10:02.183
this guy to Fully deploy.

00:10:02.423 --> 00:10:04.023
But these are our changes.

00:10:04.023 --> 00:10:05.623
Our changes are going to be a bunch of readme

00:10:05.623 --> 00:10:07.143
stuff and some configuration,

00:10:07.200 --> 00:10:09.760
but I'm just going to go ahead and merge this guy.

00:10:09.840 --> 00:10:11.371
So confirm merge.

00:10:11.704 --> 00:10:13.984
Now when we come to this production version,

00:10:13.984 --> 00:10:15.384
it looks like a new build kicked off.

00:10:15.544 --> 00:10:15.944
So

00:10:16.344 --> 00:10:18.264
this basically what happened is

00:10:18.354 --> 00:10:20.924
we merged our stage branch into our production

00:10:20.924 --> 00:10:21.284
branch

00:10:21.684 --> 00:10:23.444
and we can go ahead and view this build now.

00:10:23.444 --> 00:10:25.124
I suspect that this will work because we kind of

00:10:25.124 --> 00:10:26.564
flushed out all the kinks with

00:10:27.173 --> 00:10:29.459
we fleshed out all the kinks with the

00:10:30.660 --> 00:10:31.922
the staging branch.

00:10:32.082 --> 00:10:33.682
So this should deploy as expected.

00:10:33.886 --> 00:10:36.588
So this production build also was successful.

00:10:37.221 --> 00:10:39.221
Now when this finishes building,

00:10:39.221 --> 00:10:41.101
what you're going to notice is if you actually try

00:10:41.101 --> 00:10:42.181
to use this application,

00:10:42.341 --> 00:10:44.981
you're going to get a error over here.

00:10:45.621 --> 00:10:47.861
And the reason we're going to get an error when we

00:10:47.861 --> 00:10:50.701
navigate over to app is actually because our

00:10:50.701 --> 00:10:52.641
environment variables for build,

00:10:52.881 --> 00:10:55.561
we're not actually set up inside of the build

00:10:55.561 --> 00:10:56.081
itself.

00:10:56.161 --> 00:10:58.481
So when we head over here you're going to notice

00:10:58.481 --> 00:10:59.921
something went wrong with the application.

00:11:00.161 --> 00:11:03.281
Now this is due to the fact that this is a vite

00:11:03.281 --> 00:11:05.841
built built based application and

00:11:06.161 --> 00:11:07.841
what essentially what we're,

00:11:07.841 --> 00:11:09.521
we're having happen here is

00:11:09.681 --> 00:11:11.581
inside of our user application we have these

00:11:11.581 --> 00:11:13.981
environment variables and these environment

00:11:14.061 --> 00:11:17.341
variables are not being pushed to our GitHub repo

00:11:17.341 --> 00:11:18.301
as they shouldn't be.

00:11:18.471 --> 00:11:20.791
but essentially these are being injected into the

00:11:20.791 --> 00:11:23.551
code during build and this is also being used to

00:11:23.551 --> 00:11:24.791
basically instruct the

00:11:25.241 --> 00:11:27.531
Build compiler to know that like it actually needs

00:11:27.531 --> 00:11:29.811
to look at the Cloudflare environments stage.

00:11:29.891 --> 00:11:31.571
So what we're going to do,

00:11:31.651 --> 00:11:33.091
and there's a really easy fix

00:11:33.490 --> 00:11:35.091
is we're going to head over to

00:11:35.491 --> 00:11:36.931
our production application

00:11:37.251 --> 00:11:38.811
and after I do this for production,

00:11:38.811 --> 00:11:40.811
you can also do this on your own time for Stage

00:11:40.811 --> 00:11:42.451
because Stage is going to have the exact same

00:11:42.451 --> 00:11:42.771
issue.

00:11:42.851 --> 00:11:43.741
head over to Settings,

00:11:44.451 --> 00:11:45.731
come over to our,

00:11:46.940 --> 00:11:47.900
over to the

00:11:50.130 --> 00:11:51.140
variables and secrets.

00:11:51.140 --> 00:11:52.860
These are the variables and secrets that are part

00:11:52.860 --> 00:11:53.300
of build.

00:11:53.300 --> 00:11:55.380
These are not the variables and secrets that are

00:11:55.380 --> 00:11:56.980
part of like your worker.

00:11:57.060 --> 00:11:58.580
These are server side

00:11:58.770 --> 00:12:01.440
secrets and variables and these are build time.

00:12:01.440 --> 00:12:03.520
So these are specifically for when the application

00:12:03.520 --> 00:12:04.190
is built.

00:12:04.660 --> 00:12:05.380
so very,

00:12:05.380 --> 00:12:07.220
very very important to know the difference between

00:12:07.220 --> 00:12:07.700
these two.

00:12:08.070 --> 00:12:09.350
You can go ahead and you can add,

00:12:09.990 --> 00:12:11.990
go to your production emv,

00:12:11.990 --> 00:12:14.350
let's just grab our host and then when we add a

00:12:14.350 --> 00:12:15.590
route we'll do the same thing.

00:12:16.420 --> 00:12:17.250
that's going to be the value.

00:12:17.330 --> 00:12:20.290
We'll make sure we grab the correct variable name

00:12:20.610 --> 00:12:22.330
and then we're also going to pass in the

00:12:22.330 --> 00:12:23.090
Cloudflare environment.

00:12:23.660 --> 00:12:25.500
we actually don't need to encrypt that.

00:12:25.740 --> 00:12:27.350
So I'm going to go ahead and save

00:12:27.350 --> 00:12:29.398
and then we will go here again

00:12:29.530 --> 00:12:32.078
and we're going to say Cloudflare EMV is going to

00:12:32.078 --> 00:12:32.750
be production

00:12:33.057 --> 00:12:33.537
save.

00:12:34.177 --> 00:12:35.857
Now I'm going to head back to GitHub.

00:12:36.417 --> 00:12:37.857
I pushed a change

00:12:38.177 --> 00:12:39.457
to this branch,

00:12:39.697 --> 00:12:40.097
so

00:12:40.897 --> 00:12:41.297
should

00:12:43.120 --> 00:12:44.320
we should be able to open another

00:12:44.640 --> 00:12:45.040
pr.

00:12:45.200 --> 00:12:46.520
So pull requests,

00:12:46.520 --> 00:12:47.120
new pr.

00:12:47.407 --> 00:12:48.717
I'm going to say I want

00:12:49.034 --> 00:12:50.234
I want to merge into

00:12:51.034 --> 00:12:53.434
main here and this is going to be coming from

00:12:53.434 --> 00:12:53.834
stage.

00:12:54.018 --> 00:12:55.746
Now I'm just going to go ahead and complete this

00:12:55.746 --> 00:12:56.626
pull request

00:12:56.953 --> 00:12:58.153
and as this merges

00:12:58.473 --> 00:12:59.833
we can come back to

00:13:00.153 --> 00:13:02.353
our production application for our user

00:13:02.353 --> 00:13:02.873
application,

00:13:02.874 --> 00:13:05.328
go to deployments and we're going to see a build

00:13:05.328 --> 00:13:06.488
is currently in progress.

00:13:06.968 --> 00:13:08.648
We can go ahead and view this build.

00:13:08.648 --> 00:13:10.808
I'm going to pause and come to the end of it

00:13:11.128 --> 00:13:11.158
all.

00:13:11.168 --> 00:13:11.368
right,

00:13:11.368 --> 00:13:13.608
so this build and deployment went through

00:13:13.768 --> 00:13:14.568
successfully.

00:13:14.568 --> 00:13:16.688
So we can head back over to our production

00:13:16.688 --> 00:13:18.008
instance of our application

00:13:18.738 --> 00:13:19.698
and this should work.

00:13:19.938 --> 00:13:21.058
Everything's working as expected.

00:13:21.378 --> 00:13:21.778
So,

00:13:22.218 --> 00:13:22.938
just to kind of recap,

00:13:22.938 --> 00:13:24.058
because I know there is a lot,

00:13:24.058 --> 00:13:26.898
but basically what we did is we connected to both

00:13:27.058 --> 00:13:28.418
instances of our application,

00:13:28.418 --> 00:13:29.138
the stage

00:13:29.458 --> 00:13:30.498
and the production.

00:13:31.138 --> 00:13:31.538
We

00:13:32.628 --> 00:13:34.068
we connected our GitHub account

00:13:34.468 --> 00:13:35.748
and then we configured

00:13:36.128 --> 00:13:39.928
a build to basically say we are going to run a

00:13:40.328 --> 00:13:41.368
specific command,

00:13:41.528 --> 00:13:43.248
which is this command right here,

00:13:43.248 --> 00:13:44.568
pnpm run production,

00:13:45.628 --> 00:13:45.948
deploy,

00:13:45.948 --> 00:13:46.379
front end.

00:13:46.405 --> 00:13:49.685
And that is coming from the root of our mono repo

00:13:49.685 --> 00:13:52.045
where we specified a very custom build script that

00:13:52.045 --> 00:13:53.285
basically installs everything.

00:13:53.445 --> 00:13:54.965
It builds our package

00:13:55.365 --> 00:13:57.805
and then it filters user application and runs

00:13:57.805 --> 00:13:58.525
production build.

00:13:58.525 --> 00:14:00.725
And the production build is coming from

00:14:01.125 --> 00:14:03.605
our user application package JSON,

00:14:03.605 --> 00:14:06.565
which is literally just saying we are going to

00:14:06.805 --> 00:14:08.205
build and deploy.

00:14:08.525 --> 00:14:08.925
Now

00:14:09.195 --> 00:14:09.875
I know it was a lot,

00:14:09.875 --> 00:14:11.275
but it's actually not that complicated.

00:14:11.275 --> 00:14:13.235
It's just a lot of configuration and just like

00:14:13.235 --> 00:14:13.795
messing with things,

00:14:13.795 --> 00:14:14.955
making sure everything works.

00:14:14.955 --> 00:14:18.115
So this isn't necessarily important to configure

00:14:18.115 --> 00:14:20.235
for the purpose of this app for this course,

00:14:20.315 --> 00:14:22.395
but as you're building out your own projects,

00:14:22.395 --> 00:14:23.995
when you set things up for the very first time,

00:14:23.995 --> 00:14:25.835
I would suggest just doing this at the very

00:14:25.835 --> 00:14:26.315
beginning,

00:14:26.315 --> 00:14:27.835
then you never have to worry about it again.

00:14:27.975 --> 00:14:29.315
it just kind of like works from there,

00:14:29.315 --> 00:14:31.075
but for the rest of this course we're just going

00:14:31.075 --> 00:14:32.795
to be deploying from the terminal just because

00:14:32.795 --> 00:14:34.115
that's going to be a lot faster for us.

00:14:34.115 --> 00:14:35.475
We don't have to continuously like push our

00:14:35.475 --> 00:14:36.995
changes and merge and whatnot.

00:14:37.015 --> 00:14:37.415
so,

00:14:37.655 --> 00:14:40.095
on your own time I would say go ahead and do the

00:14:40.095 --> 00:14:42.455
same type of configuration for the data service.

00:14:42.455 --> 00:14:44.255
Data service is going to be a very similar thing.

00:14:44.255 --> 00:14:45.255
You're just going to

00:14:45.315 --> 00:14:47.995
We already have our production deploy scripts

00:14:47.995 --> 00:14:49.275
defined here at this level.

00:14:49.435 --> 00:14:51.755
So at the root of our package JSON,

00:14:52.075 --> 00:14:55.475
you'll also basically say stage deploy Data

00:14:55.475 --> 00:14:57.035
service or Stage deploy.

00:14:57.035 --> 00:14:57.315
Yeah,

00:14:57.315 --> 00:14:57.915
Data service.

00:14:57.915 --> 00:14:58.395
And then,

00:14:58.695 --> 00:14:59.915
production deploy Data service.

00:14:59.915 --> 00:15:01.275
And you'll specify your own

00:15:01.825 --> 00:15:02.225
script here,

00:15:02.225 --> 00:15:03.065
which is going to be similar.

00:15:03.065 --> 00:15:04.585
It's going to have an install,

00:15:04.585 --> 00:15:06.625
it's also going to have a run package build and

00:15:06.625 --> 00:15:07.905
it's going to pass through

00:15:08.395 --> 00:15:10.275
to the data service application.

00:15:10.275 --> 00:15:10.915
That's the only difference.

00:15:10.915 --> 00:15:12.155
And then you'll just have to make sure that you

00:15:12.155 --> 00:15:13.995
connect the GitHub or you,

00:15:14.235 --> 00:15:17.675
you configure the build on inside of Cloudflare

00:15:17.675 --> 00:15:19.115
and then everything will work as expected.

00:15:19.515 --> 00:15:20.635
So I know that was a lot.

00:15:20.635 --> 00:15:21.195
It was a lot.

00:15:21.195 --> 00:15:21.915
It was long winded.

00:15:21.915 --> 00:15:23.675
It's kind of a long video for just configuration

00:15:23.675 --> 00:15:23.915
stuff.

00:15:23.915 --> 00:15:25.635
But in this next video we're actually going to get

00:15:25.635 --> 00:15:27.915
to managing our own domains,

00:15:27.915 --> 00:15:29.395
which is really the most important thing when

00:15:29.395 --> 00:15:30.955
you're building a service is that like it's

00:15:30.955 --> 00:15:32.475
branded for your own thing and you're not using

00:15:32.475 --> 00:15:33.025
CloudFL

00:15:33.575 --> 00:15:35.045
dev randomly generated,

00:15:35.045 --> 00:15:35.635
URL.

00:15:35.635 --> 00:15:37.155
So that's what we're going to do in this next

00:15:37.155 --> 00:15:39.115
section and it's not required for the course.

00:15:39.205 --> 00:15:40.485
you don't have to buy a domain,

00:15:40.485 --> 00:15:42.645
but if you do have a domain and you're interested

00:15:42.645 --> 00:15:43.165
in this process,

00:15:43.165 --> 00:15:44.725
I'm just going to walk through the entire thing

00:15:44.725 --> 00:15:46.605
for us and then kind of show us how that wires

00:15:46.605 --> 00:15:49.445
into our stage build and our production build.

