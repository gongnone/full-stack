WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.146 --> 00:00:02.946
So throughout this course we have been appending

00:00:03.266 --> 00:00:06.226
the word stage to the end of resources that we

00:00:06.226 --> 00:00:06.546
create.

00:00:06.626 --> 00:00:08.866
And the reason we've done that is because

00:00:09.186 --> 00:00:11.306
essentially we're going to want to create some

00:00:11.306 --> 00:00:14.706
type of deployment mechanism where we can deploy

00:00:15.106 --> 00:00:17.506
two separate resources for lower environment

00:00:17.586 --> 00:00:17.946
stuff,

00:00:17.946 --> 00:00:20.066
meaning stage basically for testing and

00:00:20.066 --> 00:00:20.706
validating,

00:00:20.756 --> 00:00:22.746
to ensure like systems are functioning as normal.

00:00:22.746 --> 00:00:23.226
And then

00:00:23.836 --> 00:00:26.356
when those changes are good and we've truly

00:00:26.356 --> 00:00:28.236
validated them to be able to

00:00:28.616 --> 00:00:31.256
deploy them to a mirror of that environment for

00:00:31.256 --> 00:00:31.896
production.

00:00:31.976 --> 00:00:32.376
Now

00:00:32.776 --> 00:00:35.016
we're going to go through this process and what

00:00:35.596 --> 00:00:37.256
I just kind of want to like illustrate is there's

00:00:37.256 --> 00:00:38.616
a lot of different ways to

00:00:39.096 --> 00:00:39.816
do like

00:00:39.946 --> 00:00:42.536
CICD pipeline for continuous deployments which

00:00:42.536 --> 00:00:44.896
basically just means you have a way of auto

00:00:44.896 --> 00:00:47.176
deploying based upon some type of trigger.

00:00:47.176 --> 00:00:49.536
Now currently what we've been doing is we've been

00:00:49.536 --> 00:00:50.136
saying like

00:00:50.626 --> 00:00:51.026
pm,

00:00:51.426 --> 00:00:52.146
npm,

00:00:52.386 --> 00:00:52.786
run,

00:00:53.346 --> 00:00:53.986
deploy,

00:00:53.986 --> 00:00:54.386
right?

00:00:54.846 --> 00:00:56.726
and this has worked fine for our use case.

00:00:56.726 --> 00:00:58.646
But as you're working with the team and you're

00:00:58.646 --> 00:01:00.406
getting a little bit more professional and safe,

00:01:00.406 --> 00:01:02.006
you're going to want to have some type of

00:01:02.006 --> 00:01:03.486
mechanism that does this for you.

00:01:03.486 --> 00:01:03.886
And

00:01:04.206 --> 00:01:05.966
what I do find best for like

00:01:06.446 --> 00:01:08.686
even like starter projects that are very small,

00:01:08.846 --> 00:01:11.566
even projects that grow in size to a larger team

00:01:11.566 --> 00:01:12.766
and larger scale,

00:01:12.766 --> 00:01:15.246
GitHub Actions work very very well for this use

00:01:15.246 --> 00:01:15.446
case.

00:01:15.446 --> 00:01:16.126
Now there are

00:01:16.916 --> 00:01:18.996
more like enterprise level types of

00:01:19.446 --> 00:01:21.046
CICD pipeline tooling.

00:01:21.046 --> 00:01:24.486
But GitHub Actions really do work for like so many

00:01:24.486 --> 00:01:24.926
use cases.

00:01:24.926 --> 00:01:27.686
You'd really have to make a justification for like

00:01:27.686 --> 00:01:29.286
why it's not the case for your project.

00:01:29.546 --> 00:01:29.736
now

00:01:29.736 --> 00:01:31.061
you can imagine in GitHub

00:01:31.382 --> 00:01:33.342
we've really just like haven't done anything with

00:01:33.342 --> 00:01:35.382
branching but you could take your entire project

00:01:35.382 --> 00:01:37.142
and you could create a new branch for,

00:01:37.142 --> 00:01:39.382
for it and we'll just call this branch other.

00:01:39.622 --> 00:01:41.662
And then you could make it so you develop some

00:01:41.662 --> 00:01:43.862
changes and you push those changes to this branch

00:01:44.262 --> 00:01:44.552
and,

00:01:44.622 --> 00:01:46.262
and whenever you push this change to the branch

00:01:46.262 --> 00:01:48.302
you can configure your project to basically auto

00:01:48.302 --> 00:01:49.182
deploy for you,

00:01:49.252 --> 00:01:49.602
to

00:01:50.082 --> 00:01:52.482
a stage version of your application

00:01:52.802 --> 00:01:54.562
and you can continue to go through the cycle where

00:01:54.562 --> 00:01:55.002
you deploy,

00:01:55.002 --> 00:01:55.242
change,

00:01:55.242 --> 00:01:55.682
deploy,

00:01:55.682 --> 00:01:55.922
change,

00:01:55.922 --> 00:01:56.322
deploy,

00:01:56.322 --> 00:01:56.642
change.

00:01:56.932 --> 00:01:59.242
every time you push it's continuously deploying

00:01:59.242 --> 00:02:01.202
changes and then you can validate,

00:02:01.202 --> 00:02:02.922
make sure everything's running as expected and

00:02:02.922 --> 00:02:05.922
then when you're finally ready you can open a pull

00:02:05.922 --> 00:02:08.122
request and then merge those changes into your

00:02:08.122 --> 00:02:08.602
main branch.

00:02:08.602 --> 00:02:11.122
When that happens it can automatically trigger a

00:02:11.122 --> 00:02:12.002
prod deployment.

00:02:12.082 --> 00:02:15.042
So this is the flow that we're going to be setting

00:02:15.042 --> 00:02:15.362
up.

00:02:15.702 --> 00:02:17.662
but in order to do so we have to segment the

00:02:17.662 --> 00:02:20.422
resources in our Wrangler config to do that,

00:02:20.422 --> 00:02:21.622
to basically enable this.

00:02:21.702 --> 00:02:22.102
So,

00:02:22.502 --> 00:02:24.422
to do this is actually pretty simple.

00:02:24.662 --> 00:02:26.342
So what we're going to do is we're going to just

00:02:26.342 --> 00:02:27.302
close all this stuff.

00:02:27.462 --> 00:02:30.742
We really only care about our Wrangler files and

00:02:30.822 --> 00:02:32.102
the data service

00:02:32.742 --> 00:02:34.502
and the user service.

00:02:34.582 --> 00:02:37.022
So first thing that we're going to do is in the

00:02:37.022 --> 00:02:37.542
data service,

00:02:38.422 --> 00:02:41.302
if we head over to the Wrangler JSON C,

00:02:41.702 --> 00:02:43.302
you're going to notice there's like these things

00:02:43.302 --> 00:02:44.022
at the top level

00:02:44.562 --> 00:02:45.522
which are kind of global.

00:02:45.762 --> 00:02:46.162
The,

00:02:46.322 --> 00:02:49.202
the path to your config schema doesn't change.

00:02:49.442 --> 00:02:51.442
The name of your project isn't going to change.

00:02:51.442 --> 00:02:52.562
Like at the top level,

00:02:53.332 --> 00:02:55.012
the entry point's not going to change.

00:02:55.092 --> 00:02:56.612
Version node compatibility,

00:02:56.692 --> 00:02:59.452
observability being on or off doesn't necessarily

00:02:59.452 --> 00:02:59.812
change.

00:03:00.052 --> 00:03:01.332
But all this stuff where

00:03:01.652 --> 00:03:03.092
browser rendering is

00:03:03.212 --> 00:03:03.692
enabled,

00:03:03.692 --> 00:03:04.612
AI is enabled,

00:03:04.612 --> 00:03:05.532
R2 buckets

00:03:05.932 --> 00:03:08.372
specifically pointing to stage D1 database.

00:03:08.372 --> 00:03:11.012
So essentially what I'm going to do is I'm going

00:03:11.012 --> 00:03:12.492
to come down to the bottom of this

00:03:12.516 --> 00:03:13.934
and I'm just going to copy all this stuff.

00:03:15.742 --> 00:03:17.022
Then what we can do

00:03:17.422 --> 00:03:20.782
is basically just notice all we have is this from

00:03:20.782 --> 00:03:22.062
schema to observability.

00:03:22.782 --> 00:03:24.942
Then what you can do is you can say

00:03:25.262 --> 00:03:25.982
emv

00:03:26.702 --> 00:03:29.822
and inside of EMV you can provide your own custom

00:03:29.902 --> 00:03:30.302
key.

00:03:30.542 --> 00:03:31.202
So we'll,

00:03:31.272 --> 00:03:32.312
what we're going to say is we're going to say

00:03:32.312 --> 00:03:34.392
stage is our first custom one.

00:03:34.632 --> 00:03:35.912
And inside of Stage

00:03:36.792 --> 00:03:39.952
we can then create another object and paste all

00:03:39.952 --> 00:03:40.872
that stuff into here.

00:03:41.592 --> 00:03:42.712
So now everything

00:03:43.112 --> 00:03:45.952
that we had before that is specific to our

00:03:45.952 --> 00:03:46.232
environment

00:03:46.712 --> 00:03:48.792
is configured inside of Stage.

00:03:49.272 --> 00:03:51.912
Now if you go ahead and just try to deploy this,

00:03:52.712 --> 00:03:54.832
you're going to find that it actually doesn't pick

00:03:54.832 --> 00:03:55.752
up all of these,

00:03:55.872 --> 00:03:56.972
environment variables.

00:03:57.212 --> 00:03:59.012
And the reason why it doesn't pick up the

00:03:59.012 --> 00:04:01.092
environment variables is because our deploy script

00:04:01.092 --> 00:04:02.882
also has to reference that specific

00:04:03.191 --> 00:04:03.431
environment.

00:04:04.311 --> 00:04:05.591
So in order to do that,

00:04:05.831 --> 00:04:08.591
head over to your package JSON file and this

00:04:08.591 --> 00:04:09.311
deploy script.

00:04:09.311 --> 00:04:10.791
What we're going to do is we're going to say,

00:04:11.291 --> 00:04:11.851
stage

00:04:12.811 --> 00:04:13.451
deploy

00:04:13.510 --> 00:04:15.295
and then we are going to pass in

00:04:16.175 --> 00:04:16.575
dash,

00:04:16.575 --> 00:04:16.895
dash,

00:04:16.895 --> 00:04:17.215
env

00:04:18.415 --> 00:04:19.055
stage.

00:04:19.375 --> 00:04:21.935
So the name that we've defined for that specific

00:04:21.935 --> 00:04:22.255
env

00:04:22.458 --> 00:04:22.953
and then

00:04:23.273 --> 00:04:25.113
similarly what we can do here

00:04:25.644 --> 00:04:26.844
on our CF type gen,

00:04:27.404 --> 00:04:29.604
I guess it might make sense to illustrate this

00:04:29.604 --> 00:04:30.324
before I add it.

00:04:30.324 --> 00:04:32.284
So right now if we run pnpm,

00:04:32.284 --> 00:04:33.324
run CF

00:04:34.844 --> 00:04:35.564
type gen,

00:04:38.462 --> 00:04:40.662
we can head over to this config and what you're

00:04:40.662 --> 00:04:42.622
going to notice is all of a sudden our

00:04:42.942 --> 00:04:46.222
wrangler config EMV no longer has all of the

00:04:46.222 --> 00:04:47.182
information that we,

00:04:47.192 --> 00:04:49.122
that we currently need for our resources.

00:04:49.202 --> 00:04:50.982
Now that is because we,

00:04:51.212 --> 00:04:52.972
if you're going to have environments

00:04:53.372 --> 00:04:56.172
when you do your CF type gen when developing,

00:04:56.172 --> 00:04:57.612
this isn't something you have to do during

00:04:57.612 --> 00:04:58.252
deployments,

00:04:58.412 --> 00:05:01.572
but you're also going to want to pass in the EMV

00:05:01.572 --> 00:05:02.092
stage

00:05:02.572 --> 00:05:03.452
as a flag

00:05:03.932 --> 00:05:05.252
in this step as well.

00:05:05.252 --> 00:05:06.412
So you can pass that in.

00:05:06.732 --> 00:05:07.052
Now,

00:05:07.052 --> 00:05:08.092
when we run this,

00:05:08.172 --> 00:05:09.492
when we head over here now,

00:05:09.492 --> 00:05:12.492
you can notice all of our bindings are accessible

00:05:12.492 --> 00:05:13.130
at this level.

00:05:13.195 --> 00:05:13.595
Now,

00:05:13.595 --> 00:05:14.795
instead of running,

00:05:15.265 --> 00:05:16.705
PMPM Run Deploy,

00:05:17.175 --> 00:05:19.095
we will be running PMPM Run

00:05:19.495 --> 00:05:20.695
Stage Deploy.

00:05:20.855 --> 00:05:21.255
So

00:05:21.735 --> 00:05:24.215
I'm going to clear this out and say PNPM

00:05:25.495 --> 00:05:25.895
Run

00:05:27.015 --> 00:05:28.055
Stage Deploy.

00:05:28.722 --> 00:05:30.444
And that should go through the exact same process

00:05:30.444 --> 00:05:31.284
that we had before,

00:05:31.684 --> 00:05:34.244
but we're just specifically pointing it at stage.

00:05:35.171 --> 00:05:37.011
Now what we're going to see here is we're going to

00:05:37.011 --> 00:05:39.371
notice an error and these errors are honestly in

00:05:39.371 --> 00:05:39.891
my opinion,

00:05:39.891 --> 00:05:41.291
pretty easy to debug.

00:05:41.291 --> 00:05:42.951
You're going to get this exact same error when

00:05:42.951 --> 00:05:43.711
trying to deploy.

00:05:44.111 --> 00:05:46.311
Now the reason why you're getting this error is

00:05:46.311 --> 00:05:46.671
because,

00:05:47.311 --> 00:05:49.951
it is basically what it's saying is it's saying

00:05:49.951 --> 00:05:51.391
the queue name

00:05:51.711 --> 00:05:52.271
stage

00:05:52.671 --> 00:05:54.191
already has a consumer

00:05:54.671 --> 00:05:57.551
and a cloudflare queue can only have one consumer.

00:05:57.551 --> 00:05:59.311
So when we try to deploy this application,

00:05:59.631 --> 00:06:02.511
essentially what's happening is we have our,

00:06:03.406 --> 00:06:04.766
we had our data service

00:06:05.166 --> 00:06:07.406
and it created a new application called the Data

00:06:07.406 --> 00:06:08.286
Service Stage.

00:06:08.286 --> 00:06:09.726
Now since this is a lower environment,

00:06:09.886 --> 00:06:10.246
one,

00:06:10.246 --> 00:06:12.136
we don't necessarily care if this,

00:06:12.366 --> 00:06:12.606
this

00:06:12.866 --> 00:06:13.746
service like,

00:06:13.906 --> 00:06:15.106
is currently running,

00:06:15.186 --> 00:06:16.506
then what we can do,

00:06:16.506 --> 00:06:17.626
like there's two things we could do.

00:06:17.626 --> 00:06:20.306
We could unbind it from this application.

00:06:20.946 --> 00:06:22.426
But what I'm going to do is like,

00:06:22.426 --> 00:06:22.626
yeah,

00:06:22.626 --> 00:06:25.106
so we could essentially unbind it from the

00:06:25.766 --> 00:06:25.986
here

00:06:25.986 --> 00:06:26.720
at this level.

00:06:26.852 --> 00:06:29.532
But I'm just going to go ahead and entirely delete

00:06:29.532 --> 00:06:31.050
this service altogether

00:06:32.551 --> 00:06:35.864
and it says it has a dependency on our user

00:06:35.864 --> 00:06:36.424
application.

00:06:36.824 --> 00:06:37.224
So,

00:06:38.502 --> 00:06:38.862
yeah,

00:06:38.862 --> 00:06:40.462
so it's just going to mention that you can do it,

00:06:40.462 --> 00:06:41.222
but it will break.

00:06:41.382 --> 00:06:43.342
So I'm also going to be deleting our user

00:06:43.342 --> 00:06:44.154
application as well.

00:06:44.154 --> 00:06:47.514
it looks like it failed because it actually wants

00:06:47.514 --> 00:06:48.874
us to manually delete these.

00:06:48.874 --> 00:06:51.354
So I can just go ahead and say delete here,

00:06:52.648 --> 00:06:53.324
delete here,

00:06:54.256 --> 00:06:56.616
and then we're going to go ahead and delete the

00:06:56.616 --> 00:06:57.136
data service.

00:06:57.136 --> 00:06:58.856
Now if you're setting up a new project and you

00:06:58.856 --> 00:06:59.136
want

00:06:59.416 --> 00:07:00.316
branch versioning,

00:07:00.716 --> 00:07:02.636
I would suggest doing so,

00:07:03.716 --> 00:07:05.316
I would suggest doing so

00:07:05.876 --> 00:07:07.156
at the beginning of your project.

00:07:07.271 --> 00:07:07.551
But yeah,

00:07:07.551 --> 00:07:08.791
now we don't have that application.

00:07:08.791 --> 00:07:10.751
And I'm just going to go ahead and delete our user

00:07:10.751 --> 00:07:11.551
application as well,

00:07:11.551 --> 00:07:13.271
because we're going to basically be faced with the

00:07:13.271 --> 00:07:13.711
same thing.

00:07:13.711 --> 00:07:13.841
Or

00:07:13.841 --> 00:07:14.451
not the same thing,

00:07:14.451 --> 00:07:16.131
but we're going to have a new version of it

00:07:16.131 --> 00:07:16.531
running.

00:07:16.531 --> 00:07:16.614
So

00:07:16.614 --> 00:07:19.066
we can go ahead and say delete user application

00:07:20.275 --> 00:07:22.675
and let's go ahead and deploy this one more time.

00:07:23.062 --> 00:07:23.382
Cool.

00:07:23.462 --> 00:07:26.182
So this successfully deployed and now the URL

00:07:26.182 --> 00:07:27.942
you're going to notice is a little bit different.

00:07:28.102 --> 00:07:28.662
It is

00:07:28.982 --> 00:07:32.022
the same except it has dash stage at the end of

00:07:32.022 --> 00:07:32.182
it.

00:07:32.182 --> 00:07:34.502
And the name of the deployable is also like this.

00:07:34.742 --> 00:07:35.142
So

00:07:35.462 --> 00:07:38.062
we can also go to our user application,

00:07:38.062 --> 00:07:39.142
which I have right here,

00:07:39.702 --> 00:07:41.702
and I'm just going to go into our

00:07:42.972 --> 00:07:43.532
wrangler,

00:07:43.532 --> 00:07:44.420
JSON for that

00:07:44.420 --> 00:07:45.794
and do the exact same thing here.

00:07:45.794 --> 00:07:47.234
I'm going to copy these guys over.

00:07:49.794 --> 00:07:50.994
Then I'm going to say emv,

00:07:51.394 --> 00:07:52.354
then I'm going to say

00:07:52.994 --> 00:07:53.554
stage,

00:07:57.394 --> 00:07:58.994
then I'll paste this stuff in here.

00:07:59.467 --> 00:08:03.267
Now we should be able to also modify our package

00:08:03.267 --> 00:08:03.787
JSON.

00:08:04.267 --> 00:08:05.547
So we can just say,

00:08:07.317 --> 00:08:08.437
we can just say

00:08:09.157 --> 00:08:12.077
under deploy script or also CF type gin.

00:08:12.077 --> 00:08:14.517
We can say dash dash EMV stage

00:08:15.257 --> 00:08:16.777
and we'll do the same for our deploy

00:08:18.617 --> 00:08:21.257
and then we can go PMPM run.

00:08:24.057 --> 00:08:24.097
I'm

00:08:24.277 --> 00:08:24.957
going to call this

00:08:25.357 --> 00:08:26.717
stage Deploy.

00:08:27.597 --> 00:08:30.797
So PNPM run stage colon deploy.

00:08:32.157 --> 00:08:34.397
Now this is also going to be giving us a

00:08:34.877 --> 00:08:34.897
new

00:08:35.057 --> 00:08:35.697
URL.

00:08:35.857 --> 00:08:36.257
So

00:08:37.137 --> 00:08:39.217
what we're going to want to make sure we do is

00:08:39.217 --> 00:08:40.417
when we get that URL,

00:08:40.657 --> 00:08:40.907
we,

00:08:40.977 --> 00:08:42.497
we can also update our.

00:08:42.577 --> 00:08:42.897
Oh,

00:08:42.897 --> 00:08:44.417
it looks like we also got an error here.

00:08:44.577 --> 00:08:46.737
You have a specific environment stage,

00:08:47.137 --> 00:08:47.857
but are

00:08:48.337 --> 00:08:50.337
using redirect configuration,

00:08:51.067 --> 00:08:53.080
produced by a build tool such as vite.

00:08:53.540 --> 00:08:55.540
So after reading through their VITE

00:08:56.500 --> 00:08:58.740
documentation about environment variables,

00:08:59.060 --> 00:09:01.940
I learned that essentially you need to export a

00:09:01.940 --> 00:09:05.020
specific environment variable and then during that

00:09:05.020 --> 00:09:07.220
deployment you should be able to pick up on it.

00:09:07.220 --> 00:09:07.620
So

00:09:08.020 --> 00:09:10.020
what we can do here is in our,

00:09:11.122 --> 00:09:13.042
what we can do here is we can delete,

00:09:13.242 --> 00:09:14.782
EMV stage from our deploy.

00:09:15.182 --> 00:09:18.622
And then what I did is I added inside of my EMV

00:09:18.622 --> 00:09:19.102
file,

00:09:19.642 --> 00:09:21.422
this specific cloudflare environment.

00:09:23.293 --> 00:09:24.653
And then I said

00:09:25.133 --> 00:09:25.693
stage.

00:09:25.853 --> 00:09:28.053
So now from here your deployment should work.

00:09:28.053 --> 00:09:30.413
But I do think we might get one more error.

00:09:30.733 --> 00:09:32.573
So we'll say stage deploy

00:09:33.621 --> 00:09:36.101
and we got an error that it could not resolve the

00:09:36.101 --> 00:09:36.421
service,

00:09:37.621 --> 00:09:39.381
backend service binding.

00:09:39.781 --> 00:09:42.901
Now what I suspect is happening here is the

00:09:42.901 --> 00:09:46.181
service has actually changed the name so we can

00:09:46.181 --> 00:09:49.581
come into our Wrangler JSON C and then just make

00:09:49.581 --> 00:09:52.501
sure that this binding service name is also

00:09:52.901 --> 00:09:53.821
saying Stage,

00:09:53.821 --> 00:09:55.781
because that's the new service name that we have.

00:09:55.861 --> 00:09:58.021
So we'll try to deploy that one more time,

00:09:58.021 --> 00:09:59.940
and I do suspect this one will succeed.

00:09:59.940 --> 00:10:02.320
So that deployment did successfully succeed.

00:10:02.560 --> 00:10:04.240
And what you're going to notice is the

00:10:04.560 --> 00:10:06.880
domain name is actually slightly different because

00:10:06.880 --> 00:10:08.400
it has Stage appended on it.

00:10:08.560 --> 00:10:10.520
I'm just going to head over to our cloudflare

00:10:10.520 --> 00:10:12.240
environment and I'm going to go ahead and update

00:10:12.240 --> 00:10:12.560
that.

00:10:12.640 --> 00:10:14.320
So we now have

00:10:14.720 --> 00:10:16.080
Stage at the end of it.

00:10:16.080 --> 00:10:16.480
So

00:10:16.880 --> 00:10:17.920
we can go like this.

00:10:18.400 --> 00:10:19.949
And I'm going to deploy one more time.

00:10:19.949 --> 00:10:22.884
And then now what we should notice is we have a

00:10:23.524 --> 00:10:25.604
new version of that application up and running

00:10:25.964 --> 00:10:27.128
and we're able to hit it.

00:10:27.848 --> 00:10:29.128
We can go to the App

00:10:30.934 --> 00:10:32.728
and it looks like everything is working as

00:10:32.728 --> 00:10:33.048
expected.

00:10:33.288 --> 00:10:33.568
So,

00:10:33.568 --> 00:10:33.808
yeah,

00:10:33.808 --> 00:10:36.208
we successfully were able to kind of migrate this

00:10:36.208 --> 00:10:37.368
over to a Stage environment.

00:10:38.088 --> 00:10:39.208
Now in the next video,

00:10:39.208 --> 00:10:40.128
we're going to do the same thing,

00:10:40.128 --> 00:10:41.468
but we're going to do it for production

00:10:41.468 --> 00:10:41.748
environment.

00:10:41.828 --> 00:10:43.908
So we're also going to create a few new resources.

