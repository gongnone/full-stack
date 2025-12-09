WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.039 --> 00:00:00.359
All right,

00:00:00.359 --> 00:00:02.199
so the main caveat when deploying

00:00:02.349 --> 00:00:04.499
these changes with the payments is we need to make

00:00:04.499 --> 00:00:05.579
sure that all of our

00:00:06.159 --> 00:00:09.279
secrets and all of our variables like price IDs

00:00:09.279 --> 00:00:12.239
and whatnot also are uploaded to Cloudflare.

00:00:12.319 --> 00:00:15.079
So what we're also what I want to notice here is

00:00:15.079 --> 00:00:16.399
inside of dot EMV,

00:00:16.399 --> 00:00:18.719
we took these price IDs and we

00:00:18.869 --> 00:00:20.479
are basically just putting them here now.

00:00:20.479 --> 00:00:21.679
They actually technically,

00:00:21.679 --> 00:00:22.879
because these aren't secrets,

00:00:23.099 --> 00:00:25.179
they don't need to live in this EMV file.

00:00:25.179 --> 00:00:27.902
We could head over to our Wrangler JSON C

00:00:27.908 --> 00:00:29.908
and we could come over to,

00:00:30.498 --> 00:00:31.726
to the stage environment

00:00:32.046 --> 00:00:34.366
and then at the top level let's just go ahead and

00:00:34.366 --> 00:00:35.486
say vars.

00:00:35.566 --> 00:00:38.046
Now these vars are basically like

00:00:38.106 --> 00:00:40.506
server side environment variables that we can

00:00:40.506 --> 00:00:41.666
inject into our code.

00:00:41.666 --> 00:00:42.026
So

00:00:42.366 --> 00:00:44.566
just going to go ahead and paste these in and then

00:00:44.566 --> 00:00:47.782
just make sure they conform to our JSON schema

00:00:49.118 --> 00:00:51.278
now similarly to what's in environment.

00:00:51.598 --> 00:00:53.198
So basically like let's say

00:00:53.598 --> 00:00:53.998
we

00:00:54.398 --> 00:00:55.398
don't have these in here.

00:00:55.398 --> 00:00:56.958
So I'm just going to copy and delete these for a

00:00:56.958 --> 00:00:57.198
second.

00:00:57.358 --> 00:00:59.758
If we say pnpm run CF

00:01:00.158 --> 00:01:01.038
type gen,

00:01:02.318 --> 00:01:04.398
we're going to notice that these

00:01:04.788 --> 00:01:07.548
that these stripe product or price IDs are no

00:01:07.548 --> 00:01:08.228
longer in there.

00:01:08.308 --> 00:01:10.588
And if we head over to our Hono app we're now

00:01:10.588 --> 00:01:11.708
getting type errors here.

00:01:11.708 --> 00:01:13.748
But what we can do is we can go to,

00:01:14.198 --> 00:01:14.438
are

00:01:14.878 --> 00:01:17.178
under stage environment we can add these

00:01:17.318 --> 00:01:19.998
vars and then run CF type gen once more.

00:01:20.078 --> 00:01:22.638
And you're going to notice that you now have these

00:01:23.158 --> 00:01:26.438
stripe product IDs as actual like hard coded

00:01:26.438 --> 00:01:26.918
strings

00:01:27.158 --> 00:01:28.298
for these variables.

00:01:28.298 --> 00:01:28.578
So

00:01:29.148 --> 00:01:31.068
if we head back over to App ts

00:01:31.468 --> 00:01:33.028
we're no longer getting those type errors.

00:01:33.028 --> 00:01:34.988
So we can deploy this application

00:01:35.378 --> 00:01:36.018
and these,

00:01:36.578 --> 00:01:36.978
these

00:01:37.378 --> 00:01:39.458
runtime variables will basically be

00:01:40.138 --> 00:01:40.938
uploaded to

00:01:41.198 --> 00:01:43.338
they'll be uploaded to Cloudflare server,

00:01:43.338 --> 00:01:45.418
Cloudflare storage and then they'll be used during

00:01:45.418 --> 00:01:47.298
the runtime so you don't actually have to manually

00:01:47.298 --> 00:01:47.818
add them.

00:01:47.818 --> 00:01:48.138
Which,

00:01:48.138 --> 00:01:48.818
which is great.

00:01:49.388 --> 00:01:50.748
you only want to do this

00:01:51.068 --> 00:01:53.308
pattern of adding these variables in this

00:01:53.308 --> 00:01:55.308
configuration if they're not secrets and they're

00:01:55.308 --> 00:01:56.428
not like sensitive information.

00:01:56.668 --> 00:01:58.588
So if we say PNPM run

00:01:59.148 --> 00:02:00.668
stage deploy,

00:02:00.858 --> 00:02:01.098
this

00:02:01.318 --> 00:02:03.138
deployment should go through successfully and

00:02:03.138 --> 00:02:05.178
we'll just go ahead and open up our

00:02:05.258 --> 00:02:08.498
stage.smartlink.com or whatever URL you have for

00:02:08.498 --> 00:02:08.587
it.

00:02:08.587 --> 00:02:10.713
And before going through this login process,

00:02:10.793 --> 00:02:13.113
what I want to do is I actually just want to

00:02:13.213 --> 00:02:15.223
make sure we have Our webhooks set up properly

00:02:15.223 --> 00:02:16.663
inside of the Stripe dashboard.

00:02:16.663 --> 00:02:19.663
So in the Stripe dashboard you can head over to,

00:02:20.533 --> 00:02:22.373
you can head over to developers

00:02:23.013 --> 00:02:24.518
and you can go to webhooks

00:02:24.703 --> 00:02:26.914
and you can see that you currently have this Web

00:02:26.914 --> 00:02:28.194
Hook listening right now

00:02:28.514 --> 00:02:30.194
we'll just kind of copy that path,

00:02:30.644 --> 00:02:31.854
as like a local listener.

00:02:31.854 --> 00:02:34.494
But we're going to want to create an actual

00:02:34.494 --> 00:02:35.054
endpoint,

00:02:35.264 --> 00:02:37.584
for our application that is deployed.

00:02:37.584 --> 00:02:40.704
So we can go ahead and we can say HTTPs

00:02:42.224 --> 00:02:42.704
and then

00:02:43.024 --> 00:02:45.504
stage.smart

00:02:45.824 --> 00:02:46.304
link.

00:02:47.624 --> 00:02:49.144
I'm going to make sure I actually have the right

00:02:49.464 --> 00:02:51.544
URL here because I would not.

00:02:51.624 --> 00:02:52.184
Okay,

00:02:52.264 --> 00:02:52.490
so

00:02:52.490 --> 00:02:54.711
stage smart stage.smartlink.com

00:02:54.779 --> 00:02:58.099
and that's going to go to API Auth Stripe Web

00:02:58.099 --> 00:02:58.339
Hook.

00:02:58.339 --> 00:03:00.499
So this is going to be taken care of by the better

00:03:00.499 --> 00:03:01.819
auth handler for us.

00:03:02.459 --> 00:03:05.099
Now what we can do is it's going to say listen to

00:03:05.339 --> 00:03:06.379
events on your account,

00:03:06.779 --> 00:03:08.739
events on connected accounts.

00:03:08.739 --> 00:03:10.539
So you're going to want to listen to the events on

00:03:10.539 --> 00:03:10.939
your account

00:03:11.519 --> 00:03:13.079
and then you can select the events that you want

00:03:13.079 --> 00:03:13.559
to listen to.

00:03:13.559 --> 00:03:14.079
Now better,

00:03:14.319 --> 00:03:14.639
better.

00:03:14.639 --> 00:03:15.759
Auths docs

00:03:16.239 --> 00:03:18.959
should have the events that we care about.

00:03:19.032 --> 00:03:19.780
It is in this,

00:03:19.780 --> 00:03:21.460
setup Stripe webhook section.

00:03:21.700 --> 00:03:22.420
So they care.

00:03:22.420 --> 00:03:24.380
They say at a minimum we're going to want to

00:03:24.380 --> 00:03:24.980
listen to,

00:03:25.990 --> 00:03:27.190
session complete.

00:03:27.750 --> 00:03:28.470
So we can

00:03:28.790 --> 00:03:31.350
come over to here and we can basically say,

00:03:32.020 --> 00:03:34.340
session complete or checkout session complete.

00:03:35.290 --> 00:03:36.330
subscription updated

00:03:37.224 --> 00:03:37.864
and then

00:03:38.264 --> 00:03:39.455
subscription deleted.

00:03:40.268 --> 00:03:42.428
So at a minimum this is what we want to listen to.

00:03:42.508 --> 00:03:44.388
Now there's a lot of different events that you

00:03:44.388 --> 00:03:46.548
have access to and you can always update these

00:03:46.548 --> 00:03:47.228
later as well.

00:03:47.308 --> 00:03:49.228
So we'll go ahead and add endpoint.

00:03:49.278 --> 00:03:49.640
Cool.

00:03:49.640 --> 00:03:50.800
So this is now enabled,

00:03:51.400 --> 00:03:53.720
and then it's going to give us this webhook

00:03:54.000 --> 00:03:54.400
id.

00:03:54.640 --> 00:03:58.520
So from here we can go over to our cloudflare

00:03:58.520 --> 00:03:59.120
dashboard.

00:03:59.120 --> 00:04:00.630
I'm going to open this in a new tab

00:04:00.779 --> 00:04:02.819
and head over to the application that we just

00:04:02.819 --> 00:04:03.739
deployed in Workers.

00:04:04.059 --> 00:04:05.899
So our user application here,

00:04:06.319 --> 00:04:06.939
for Stage,

00:04:07.259 --> 00:04:09.299
I'm going to go to Settings and then we're going

00:04:09.299 --> 00:04:10.699
to be adding some

00:04:11.679 --> 00:04:14.559
additional secrets here so we can go add.

00:04:14.682 --> 00:04:16.462
And this is going to be a secret and

00:04:17.102 --> 00:04:18.622
we'll put in the value and

00:04:18.942 --> 00:04:20.902
make sure we have the right key for it.

00:04:20.902 --> 00:04:22.622
So in emv we have our

00:04:22.942 --> 00:04:24.622
stripe webhook key

00:04:25.872 --> 00:04:28.192
and then also I'm going to put in our

00:04:28.752 --> 00:04:31.512
stripe secret key at the same time so we can say

00:04:31.512 --> 00:04:32.432
that's also a secret.

00:04:32.912 --> 00:04:33.872
Paste in the key,

00:04:34.512 --> 00:04:35.392
grab the value

00:04:35.712 --> 00:04:36.112
here.

00:04:36.752 --> 00:04:37.232
Boom.

00:04:37.312 --> 00:04:37.952
Okay,

00:04:38.592 --> 00:04:39.952
then we should redeploy this

00:04:41.176 --> 00:04:41.816
all right,

00:04:41.976 --> 00:04:42.816
so from here,

00:04:42.816 --> 00:04:44.616
what I'm going to do is I'm going to say look at.

00:04:44.616 --> 00:04:45.656
Let's look at user.

00:04:45.996 --> 00:04:48.396
so we should have two users in this,

00:04:48.616 --> 00:04:48.936
table.

00:04:48.936 --> 00:04:49.536
Right now,

00:04:50.336 --> 00:04:53.416
what I want to do for testing purposes is I'm just

00:04:53.416 --> 00:04:55.616
going to go ahead and log in with another email.

00:04:55.654 --> 00:04:55.785
Oh,

00:04:55.785 --> 00:04:57.305
it looks like we're getting a failure.

00:04:57.385 --> 00:04:58.105
What's that?

00:04:58.760 --> 00:05:00.640
So I actually think what's happening here is,

00:05:00.640 --> 00:05:03.640
I just kind of noticed it before is in these

00:05:03.960 --> 00:05:03.980
variables,

00:05:04.420 --> 00:05:05.220
and secrets,

00:05:05.220 --> 00:05:07.420
our Google information is not in there.

00:05:07.420 --> 00:05:07.620
So,

00:05:07.620 --> 00:05:07.900
like,

00:05:08.620 --> 00:05:11.420
I'm going to go ahead and add our Google secret

00:05:12.140 --> 00:05:13.340
as a secret here

00:05:13.698 --> 00:05:15.099
and copy this guy.

00:05:15.688 --> 00:05:17.098
And while that's going,

00:05:17.178 --> 00:05:19.178
I'm going to grab our client ID

00:05:19.191 --> 00:05:21.748
and I'm going to actually save this inside because

00:05:21.748 --> 00:05:23.908
the client ID is not really sensitive.

00:05:24.138 --> 00:05:24.608
you don't.

00:05:24.848 --> 00:05:26.448
It's meant to live on the client.

00:05:26.448 --> 00:05:26.848
So

00:05:27.358 --> 00:05:29.198
I'm going to go ahead and put that into here

00:05:31.498 --> 00:05:33.162
and PNPM run

00:05:33.802 --> 00:05:35.082
stage deploy.

00:05:35.256 --> 00:05:35.795
All right.

00:05:35.795 --> 00:05:38.475
It asked if I wanted to continue because it looks

00:05:38.475 --> 00:05:39.875
like I have changed some,

00:05:40.015 --> 00:05:41.295
variables in the Cloudflare dashboard.

00:05:41.295 --> 00:05:41.655
I just said,

00:05:41.655 --> 00:05:42.015
yes,

00:05:42.095 --> 00:05:43.135
everything deployed.

00:05:43.455 --> 00:05:45.535
These are our variables here.

00:05:45.935 --> 00:05:47.815
So now you can see in our dashboard,

00:05:47.815 --> 00:05:49.175
we have all stripe.

00:05:49.175 --> 00:05:50.715
Stripe keys that are secret.

00:05:50.875 --> 00:05:51.755
We have our products,

00:05:51.755 --> 00:05:53.195
and we also have our Google information.

00:05:53.275 --> 00:05:54.315
Some of these are secrets,

00:05:54.315 --> 00:05:55.595
and some of these are just plain text,

00:05:55.595 --> 00:05:56.095
variables,

00:05:56.095 --> 00:05:57.615
depending on the sensitivity of those.

00:05:57.615 --> 00:05:58.335
Those values.

00:05:58.335 --> 00:05:58.695
So

00:05:59.015 --> 00:06:01.775
let's go ahead and try this guy one more time.

00:06:01.775 --> 00:06:03.095
I suspect this should work.

00:06:03.575 --> 00:06:03.975
Cool.

00:06:03.975 --> 00:06:04.495
Okay,

00:06:04.495 --> 00:06:06.295
now this is kind of another issue that we're going

00:06:06.295 --> 00:06:06.935
to be running into.

00:06:07.005 --> 00:06:07.935
in our Google console,

00:06:07.935 --> 00:06:09.495
I have not whitelisted this.

00:06:09.655 --> 00:06:10.615
This domain.

00:06:13.728 --> 00:06:14.168
All right,

00:06:14.168 --> 00:06:16.928
so I'm heading over to our credentials and

00:06:17.888 --> 00:06:18.852
smart links,

00:06:18.852 --> 00:06:19.428
and then

00:06:19.908 --> 00:06:22.108
I'm just gonna make sure we're whitelisting this

00:06:22.108 --> 00:06:22.868
guy as well.

00:06:23.108 --> 00:06:25.748
And I'm gonna make sure we have this as a valid

00:06:26.308 --> 00:06:28.228
redirect as well here.

00:06:28.628 --> 00:06:29.368
So I'll.

00:06:29.438 --> 00:06:30.038
I'll save that.

00:06:30.038 --> 00:06:31.438
It may take five minutes.

00:06:31.468 --> 00:06:32.928
so if it doesn't work this next time,

00:06:32.928 --> 00:06:34.728
I'll just pause and then wait five minutes.

00:06:34.728 --> 00:06:36.568
So just reload this guy.

00:06:36.728 --> 00:06:37.368
Let's see.

00:06:37.608 --> 00:06:38.168
Boom.

00:06:38.248 --> 00:06:38.608
Oh,

00:06:38.608 --> 00:06:38.968
yeah,

00:06:39.128 --> 00:06:40.088
it was pretty immediate,

00:06:40.088 --> 00:06:40.408
actually.

00:06:40.648 --> 00:06:41.088
All right,

00:06:41.088 --> 00:06:43.048
so I'm going to use this email that I haven't used

00:06:43.048 --> 00:06:43.368
before.

00:06:43.829 --> 00:06:44.229
and

00:06:44.869 --> 00:06:46.069
let's go ahead and continue.

00:06:46.538 --> 00:06:46.905
Cool.

00:06:46.985 --> 00:06:47.198
So

00:06:47.198 --> 00:06:47.938
we're logged in.

00:06:47.938 --> 00:06:49.538
Let's head over to our database.

00:06:49.858 --> 00:06:50.578
Our users.

00:06:50.578 --> 00:06:52.578
We can see we now have this new user.

00:06:52.578 --> 00:06:54.818
And let's see if it created our stripe.

00:06:54.998 --> 00:06:55.198
Yep,

00:06:55.198 --> 00:06:56.118
it created our stripe.

00:06:56.118 --> 00:06:56.558
Customer,

00:06:56.558 --> 00:06:57.358
which is awesome.

00:06:57.358 --> 00:06:59.558
So our Stripe API is at least working.

00:07:00.358 --> 00:07:00.718
Now.

00:07:00.718 --> 00:07:02.598
Let's go ahead and do the payment,

00:07:02.678 --> 00:07:04.278
see if the payment's going to work as.

00:07:04.278 --> 00:07:04.918
As expected.

00:07:05.238 --> 00:07:06.444
So let's start with Basic

00:07:06.448 --> 00:07:07.968
and I'm just going to do

00:07:08.288 --> 00:07:09.248
Cash app again.

00:07:11.626 --> 00:07:12.026
Awesome.

00:07:12.026 --> 00:07:12.906
Now that that went through,

00:07:12.906 --> 00:07:14.746
it shows that this is on our current plan,

00:07:15.306 --> 00:07:16.106
which is great.

00:07:16.626 --> 00:07:19.146
we should see this new subscription in our

00:07:19.146 --> 00:07:20.866
subscription table as well.

00:07:20.888 --> 00:07:21.398
Yep.

00:07:21.888 --> 00:07:22.958
on the basic plan.

00:07:23.838 --> 00:07:25.598
Now let's upgrade to,

00:07:26.538 --> 00:07:27.178
upgrade to Pro.

00:07:27.212 --> 00:07:28.184
Go ahead and upgrade.

00:07:28.443 --> 00:07:28.607
Now,

00:07:28.607 --> 00:07:30.567
it didn't change in here,

00:07:30.567 --> 00:07:32.767
which makes me think the web hooks might not be

00:07:32.767 --> 00:07:33.047
working.

00:07:33.207 --> 00:07:34.087
So inside of,

00:07:34.587 --> 00:07:35.227
Stripe,

00:07:35.227 --> 00:07:37.227
let's go ahead and reload this.

00:07:37.631 --> 00:07:37.911
Cool.

00:07:37.911 --> 00:07:38.311
All right,

00:07:38.311 --> 00:07:40.831
so what we're going to see here is,

00:07:42.111 --> 00:07:43.711
essentially what's happening is

00:07:43.975 --> 00:07:46.446
it failed to connect to remote host.

00:07:46.766 --> 00:07:47.486
So the,

00:07:48.606 --> 00:07:50.534
the web hooks are indeed failing here.

00:07:50.534 --> 00:07:52.004
Now I'm just going to make sure one,

00:07:52.004 --> 00:07:54.604
I have the right web hook inside of my secret.

00:07:54.684 --> 00:07:55.964
So if I head over to the service

00:07:56.824 --> 00:07:57.784
and I go to settings,

00:07:58.494 --> 00:08:00.044
and I go to my web hook,

00:08:00.044 --> 00:08:02.284
I can just say I'm going to recycle this.

00:08:02.614 --> 00:08:03.664
I'm going to rotate this

00:08:03.823 --> 00:08:04.543
key here,

00:08:04.943 --> 00:08:05.583
deploy,

00:08:05.803 --> 00:08:08.235
and then you can actually resend these events.

00:08:08.235 --> 00:08:10.755
So I'm going to go ahead and resend this one

00:08:10.975 --> 00:08:13.295
I'll resend the last one is probably what's the

00:08:13.295 --> 00:08:13.992
best thing to do.

00:08:14.052 --> 00:08:14.292
All right,

00:08:14.292 --> 00:08:15.572
that one still failed.

00:08:15.912 --> 00:08:18.472
and the reason it failed is I did not put in the

00:08:18.472 --> 00:08:19.231
right URL.

00:08:19.231 --> 00:08:20.352
I had a typo in here,

00:08:20.352 --> 00:08:22.312
which is a really silly thing to do.

00:08:22.962 --> 00:08:24.962
let's go ahead and update details.

00:08:25.682 --> 00:08:27.722
So let's make sure we're going to be sending this

00:08:27.722 --> 00:08:28.442
to the right thing,

00:08:28.442 --> 00:08:29.762
which is such a silly thing.

00:08:29.842 --> 00:08:30.242
So,

00:08:31.284 --> 00:08:34.161
stage SmartLink API update endpoint,

00:08:34.161 --> 00:08:36.547
and let's go ahead and retry this sending

00:08:36.627 --> 00:08:37.347
mechanism.

00:08:37.536 --> 00:08:38.871
Looks like it fell once again

00:08:39.166 --> 00:08:39.563
and

00:08:40.003 --> 00:08:41.123
I typed it wrong again.

00:08:41.363 --> 00:08:41.763
So

00:08:42.263 --> 00:08:44.023
I think I've been recording way too long at this

00:08:44.023 --> 00:08:44.343
point.

00:08:44.343 --> 00:08:45.143
So dot com,

00:08:45.143 --> 00:08:45.863
obviously,

00:08:45.863 --> 00:08:47.543
so update that endpoint

00:08:48.023 --> 00:08:50.693
and let's try to reason that one more time.

00:08:51.481 --> 00:08:51.961
Okay,

00:08:52.121 --> 00:08:54.121
now this is way more promising.

00:08:54.201 --> 00:08:56.881
So now we're actually getting a legit error

00:08:56.881 --> 00:08:58.841
message in here which is kind of coming from

00:08:58.841 --> 00:09:00.201
Better Auth saying what

00:09:00.601 --> 00:09:03.601
is happening or kind of coming from the Stripe SDK

00:09:03.601 --> 00:09:04.321
inside of Better Auth.

00:09:04.321 --> 00:09:06.441
Now this is another stupid thing on my part,

00:09:06.441 --> 00:09:08.561
so I'm so sorry if you're following along like to

00:09:08.561 --> 00:09:09.001
the T.

00:09:09.081 --> 00:09:11.801
I kind of misled led you astray once again.

00:09:11.801 --> 00:09:14.001
So this is not the webhook Key,

00:09:14.001 --> 00:09:15.041
which is so silly of me.

00:09:15.041 --> 00:09:15.401
It's just,

00:09:15.401 --> 00:09:16.121
it's just the id.

00:09:16.301 --> 00:09:17.421
if we head back to

00:09:18.281 --> 00:09:18.521
the

00:09:18.761 --> 00:09:19.561
web hooks,

00:09:19.721 --> 00:09:22.601
we should be able to create a webhook key inside

00:09:22.601 --> 00:09:22.929
of here.

00:09:23.016 --> 00:09:24.376
Now what I ended up doing,

00:09:24.836 --> 00:09:25.206
is

00:09:25.526 --> 00:09:27.846
there was this button called Switch to workbench

00:09:27.926 --> 00:09:29.766
inside of the webhook thing.

00:09:29.766 --> 00:09:32.366
And then once you actually switch to workbench you

00:09:32.366 --> 00:09:34.006
have a more in depth

00:09:34.416 --> 00:09:36.416
configuration panel that pops up here.

00:09:36.816 --> 00:09:38.653
So inside of webhooks

00:09:38.707 --> 00:09:40.867
you can actually click on a,

00:09:41.020 --> 00:09:43.110
you can actually click on a given web hook here

00:09:43.590 --> 00:09:46.430
and then you're taken to the signing signature and

00:09:46.430 --> 00:09:47.990
this is ultimately what you want.

00:09:48.230 --> 00:09:50.550
So you can go ahead and copy that guy,

00:09:50.654 --> 00:09:52.084
head back over to

00:09:52.404 --> 00:09:55.124
your worker and then let's rotate that webhook key

00:09:55.124 --> 00:09:56.084
one last time.

00:09:58.576 --> 00:09:58.816
Sorry,

00:09:58.816 --> 00:10:00.176
this section is a little bit rough,

00:10:00.176 --> 00:10:03.096
but I think that this is good to kind of see how

00:10:03.096 --> 00:10:05.016
you also can troubleshoot it because if it went

00:10:05.016 --> 00:10:06.576
100% smooth the first time,

00:10:07.056 --> 00:10:09.216
you're not going to have any context to issues

00:10:09.216 --> 00:10:10.135
that you might encounter.

00:10:10.135 --> 00:10:10.496
So

00:10:11.456 --> 00:10:13.216
now from here let's just go ahead and take a look

00:10:13.216 --> 00:10:14.016
at our events.

00:10:14.176 --> 00:10:16.736
So inside of the workbench it's a little bit more

00:10:16.736 --> 00:10:17.346
detailed

00:10:17.346 --> 00:10:18.636
of information that you have here.

00:10:18.876 --> 00:10:20.636
So we can then again see,

00:10:20.966 --> 00:10:22.276
we can filter by status.

00:10:22.276 --> 00:10:23.938
So let's just go ahead and say failed.

00:10:24.590 --> 00:10:24.830
and

00:10:24.990 --> 00:10:25.864
we can go.

00:10:26.333 --> 00:10:28.716
Actually I wonder if they replayed those events.

00:10:28.716 --> 00:10:29.116
So,

00:10:29.606 --> 00:10:31.434
looks like they replayed those events.

00:10:31.954 --> 00:10:34.594
I'll just go to subscription updated really quick

00:10:34.674 --> 00:10:35.074
for

00:10:35.364 --> 00:10:36.074
this user

00:10:36.394 --> 00:10:37.994
and I'm just going to resend it.

00:10:37.994 --> 00:10:39.594
So we'll resend this one.

00:10:39.624 --> 00:10:41.427
They do looks like they do auto retry though

00:10:41.538 --> 00:10:43.488
and it looks like that just went through.

00:10:44.098 --> 00:10:44.508
so yeah,

00:10:44.508 --> 00:10:47.308
it looks like these web hooks are now working as

00:10:47.308 --> 00:10:47.628
expected.

00:10:48.058 --> 00:10:50.352
I just want to try to see if I can't replay

00:10:50.352 --> 00:10:51.192
another one of these.

00:10:52.357 --> 00:10:52.704
yeah,

00:10:52.704 --> 00:10:54.424
so it looks like these also went through.

00:10:54.958 --> 00:10:55.598
I mean I could,

00:10:55.758 --> 00:10:57.958
I could retry it just for the sake of retrying it,

00:10:57.958 --> 00:10:59.278
but these should also be going through.

00:10:59.278 --> 00:10:59.558
Yeah,

00:10:59.558 --> 00:11:00.958
that also went through successful.

00:11:00.958 --> 00:11:02.598
So our web hooks are now working.

00:11:02.598 --> 00:11:05.558
And then I do suspect if we come over to our logs,

00:11:05.558 --> 00:11:08.398
we should see the previous error logs in here.

00:11:08.398 --> 00:11:10.478
So let's just filter by the last 15 minutes.

00:11:11.578 --> 00:11:12.018
you know,

00:11:12.018 --> 00:11:13.578
we should be able to see like hey,

00:11:13.578 --> 00:11:15.098
there was some issues into here.

00:11:15.278 --> 00:11:16.958
no IP address found for rate limiting.

00:11:16.958 --> 00:11:17.198
Okay,

00:11:17.198 --> 00:11:19.238
here's our specific better auth secret.

00:11:19.711 --> 00:11:20.231
oh yeah,

00:11:20.231 --> 00:11:20.831
this is another,

00:11:20.911 --> 00:11:22.911
another site thing that we'll get into but

00:11:23.650 --> 00:11:24.826
last 15 minutes

00:11:25.146 --> 00:11:26.746
now we should see some of these.

00:11:26.986 --> 00:11:29.266
It looks like the logs are lagging just a little

00:11:29.266 --> 00:11:29.426
bit.

00:11:29.426 --> 00:11:30.426
But you should see that

00:11:30.826 --> 00:11:31.226
these

00:11:31.436 --> 00:11:33.796
web hooks are going to be actually processed

00:11:35.456 --> 00:11:37.936
so let's just go ahead and try to

00:11:38.838 --> 00:11:39.318
So yeah,

00:11:39.318 --> 00:11:39.838
look at it.

00:11:39.838 --> 00:11:41.318
Switched over to the current plan because that was

00:11:41.318 --> 00:11:42.038
the original issue.

00:11:42.038 --> 00:11:43.518
So now that we're on the current plan,

00:11:43.518 --> 00:11:46.078
let's just make sure our cancellation thing works

00:11:46.078 --> 00:11:46.518
as expected.

00:11:46.758 --> 00:11:49.078
So we'll be directed to the cancellation.

00:11:49.946 --> 00:11:50.358
Cool.

00:11:50.358 --> 00:11:51.758
Now when we reload this page,

00:11:51.758 --> 00:11:52.778
it's going to be showing that

00:11:52.778 --> 00:11:53.898
it's a cancellation period.

00:11:53.898 --> 00:11:56.844
So web hooks are entirely flushed out here.

00:11:57.704 --> 00:11:58.064
All right,

00:11:58.064 --> 00:11:58.734
so now that

00:11:58.734 --> 00:12:00.659
our subscriptions are fully working and everything

00:12:00.659 --> 00:12:01.459
is looking good,

00:12:01.459 --> 00:12:02.619
if you wanted to,

00:12:02.619 --> 00:12:04.659
you could go and create these products in like an

00:12:04.659 --> 00:12:06.899
actual real Stripe account that takes actual

00:12:06.899 --> 00:12:08.579
payments and you could go through the process of

00:12:08.579 --> 00:12:09.529
integrating and whatnot.

00:12:09.529 --> 00:12:09.738
yeah,

00:12:09.738 --> 00:12:10.539
totally up to you.

00:12:10.929 --> 00:12:11.339
it's,

00:12:11.339 --> 00:12:11.699
you know,

00:12:11.699 --> 00:12:13.499
the exact same process that we did for Stage.

00:12:13.499 --> 00:12:15.899
It's literally mirrored as an into production.

00:12:15.899 --> 00:12:17.229
So I'll leave that one to you,

00:12:17.229 --> 00:12:18.219
if you want to go that route.

00:12:18.219 --> 00:12:20.059
But I do want to address this issue.

00:12:20.139 --> 00:12:20.539
So

00:12:20.839 --> 00:12:21.959
this is something that like,

00:12:21.959 --> 00:12:22.839
is actually really important.

00:12:22.919 --> 00:12:26.039
And it's essentially saying that the Better Auth

00:12:26.039 --> 00:12:26.839
secret in your environment,

00:12:27.349 --> 00:12:28.499
variables is not

00:12:28.699 --> 00:12:29.099
set.

00:12:29.099 --> 00:12:30.379
So it's using a default one,

00:12:30.379 --> 00:12:32.419
which basically means it is not going to be

00:12:32.419 --> 00:12:32.859
secure.

00:12:32.859 --> 00:12:33.259
So

00:12:33.529 --> 00:12:36.219
what happens with Better Auth is they take in a

00:12:36.219 --> 00:12:36.779
sequence,

00:12:37.019 --> 00:12:39.419
some type of code provided by you and that's kind

00:12:39.419 --> 00:12:40.434
of like a source of truth.

00:12:40.434 --> 00:12:42.554
So when Better Auth actually starts creating JSON

00:12:42.554 --> 00:12:43.194
web tokens,

00:12:43.194 --> 00:12:44.594
if you configure it to do so,

00:12:44.594 --> 00:12:46.594
it's going to be using that as the actual like

00:12:46.594 --> 00:12:46.874
key.

00:12:47.504 --> 00:12:48.944
And if it's just using the default key,

00:12:48.944 --> 00:12:50.064
it's actually no longer

00:12:50.264 --> 00:12:52.104
secure because it's using a default key.

00:12:52.184 --> 00:12:54.104
So in order to fix this issue,

00:12:54.184 --> 00:12:56.944
what we can do is we can head over to our Data Ops

00:12:56.944 --> 00:12:59.104
package and at the top level we're just going to

00:12:59.104 --> 00:12:59.384
say

00:13:00.044 --> 00:13:00.304
secret.

00:13:03.424 --> 00:13:04.784
And that's going to be a string.

00:13:05.082 --> 00:13:05.688
I'm sorry,

00:13:05.688 --> 00:13:08.248
it should not live at the level of stripe.

00:13:08.248 --> 00:13:10.158
basically what we're going to do is we can come

00:13:10.158 --> 00:13:10.878
into our

00:13:11.078 --> 00:13:13.317
top level here and we're just going to say this is

00:13:13.317 --> 00:13:14.157
going to take a

00:13:14.717 --> 00:13:15.117
secret

00:13:15.437 --> 00:13:16.797
and it's going to be a string.

00:13:17.197 --> 00:13:19.437
And then that should be passed into this,

00:13:19.638 --> 00:13:20.897
better off as well.

00:13:21.057 --> 00:13:21.457
So

00:13:21.937 --> 00:13:23.457
we'll be passing that into here

00:13:24.417 --> 00:13:25.377
and then make sure.

00:13:25.377 --> 00:13:27.137
We add it at this level as well.

00:13:27.377 --> 00:13:27.777
So

00:13:28.137 --> 00:13:30.377
I'm actually going to put it after database

00:13:31.017 --> 00:13:31.577
string

00:13:33.185 --> 00:13:33.425
and

00:13:34.028 --> 00:13:34.686
put it here.

00:13:37.672 --> 00:13:39.952
And then the last thing we need to do is inside of

00:13:39.952 --> 00:13:42.672
our better auth config after database we're just

00:13:42.672 --> 00:13:43.272
going to say

00:13:43.591 --> 00:13:43.992
secret

00:13:44.632 --> 00:13:45.752
is going to be secret

00:13:47.064 --> 00:13:47.696
and then

00:13:48.156 --> 00:13:50.156
we might have to update this as well.

00:13:50.316 --> 00:13:50.716
So

00:13:51.176 --> 00:13:55.256
for now we are just going to be passing in a comma

00:13:55.256 --> 00:13:57.536
an empty string because this is our generate,

00:13:57.536 --> 00:13:57.856
remember,

00:13:57.856 --> 00:13:58.976
this is our generate script.

00:13:58.976 --> 00:14:01.016
So we don't really care what's being passed into

00:14:01.016 --> 00:14:01.336
here.

00:14:01.496 --> 00:14:03.006
But we'll build this one more time.

00:14:03.006 --> 00:14:03.652
Now we head,

00:14:03.652 --> 00:14:06.572
once it's done being built we'll head over to our

00:14:06.812 --> 00:14:07.452
EMV

00:14:08.332 --> 00:14:10.172
and we're going to call this our

00:14:10.572 --> 00:14:10.972
app

00:14:11.772 --> 00:14:12.172
secret.

00:14:13.372 --> 00:14:14.572
And our app secret

00:14:14.850 --> 00:14:16.808
you can actually generate a random one.

00:14:16.808 --> 00:14:17.648
So like let's say

00:14:18.728 --> 00:14:19.288
generate

00:14:19.878 --> 00:14:20.758
uuid.

00:14:21.305 --> 00:14:23.116
So essentially you're going to want like a very

00:14:23.116 --> 00:14:26.236
long secure random type of code or hash or

00:14:26.236 --> 00:14:26.516
something.

00:14:26.516 --> 00:14:28.316
And this is now going to be called your app

00:14:28.316 --> 00:14:28.676
secret.

00:14:28.756 --> 00:14:31.716
And we can go into here and say PNPM run CF

00:14:32.356 --> 00:14:33.076
type gen.

00:14:33.104 --> 00:14:34.444
and then inside of app

00:14:34.924 --> 00:14:36.844
we'll go ahead and pass the

00:14:37.164 --> 00:14:37.564
this

00:14:38.604 --> 00:14:41.317
or emv.app secret into here

00:14:41.657 --> 00:14:43.958
and this is actually going to be passed in at the

00:14:43.958 --> 00:14:44.781
end on the side

00:14:46.069 --> 00:14:47.929
right now we can deploy PNPM run

00:14:48.409 --> 00:14:49.049
stage

00:14:49.849 --> 00:14:50.489
deploy.

00:14:50.512 --> 00:14:51.618
And while that's going

00:14:52.178 --> 00:14:52.578
I,

00:14:52.738 --> 00:14:53.218
we're just,

00:14:53.218 --> 00:14:54.578
we can just take this app key,

00:14:55.288 --> 00:14:56.408
head on over to

00:14:56.808 --> 00:14:57.208
here

00:14:57.399 --> 00:14:58.759
and once we add

00:14:59.159 --> 00:15:00.359
this as a

00:15:01.499 --> 00:15:02.779
and on this side of things

00:15:03.186 --> 00:15:05.118
we're no longer going to be getting that issue in

00:15:05.118 --> 00:15:05.838
our logs.

00:15:06.208 --> 00:15:06.648
yeah,

00:15:06.648 --> 00:15:08.648
so this is just kind of like the last part of the

00:15:08.648 --> 00:15:09.248
better auth

00:15:09.648 --> 00:15:10.048
section,

00:15:10.048 --> 00:15:10.840
I would say so.

00:15:11.688 --> 00:15:12.168
All right,

00:15:12.328 --> 00:15:15.448
so at this point we have authentication fully

00:15:15.448 --> 00:15:15.968
baked.

00:15:15.968 --> 00:15:18.928
We have stripe subscription subscriptions fully

00:15:18.928 --> 00:15:19.328
baked.

00:15:19.328 --> 00:15:19.928
We've also

00:15:20.328 --> 00:15:21.448
built out an entire

00:15:21.848 --> 00:15:24.648
system and service on top of Cloudflare utilizing

00:15:24.648 --> 00:15:26.167
their core compute primitive.

00:15:26.248 --> 00:15:27.768
So at this point we should have a very,

00:15:27.768 --> 00:15:29.688
very in depth understanding on how to ship to

00:15:29.688 --> 00:15:30.168
Cloudflare.

00:15:30.168 --> 00:15:31.318
I really hope so at this point.

00:15:31.328 --> 00:15:33.768
now the last little bit of the course is just

00:15:33.768 --> 00:15:35.128
going to be tidying up some things.

00:15:35.128 --> 00:15:37.168
So there's some specific things inside of here

00:15:37.168 --> 00:15:38.848
where it's like the dashboard,

00:15:39.168 --> 00:15:40.928
some of this data is still just dummy.

00:15:41.248 --> 00:15:43.088
so what we're going to want to do is actually like

00:15:43.248 --> 00:15:44.688
wire in these real queries,

00:15:44.688 --> 00:15:46.728
make sure all of these functionalities are working

00:15:46.728 --> 00:15:47.328
as expected.

00:15:47.408 --> 00:15:49.168
So a little bit more TRPC stuff

00:15:49.568 --> 00:15:49.968
and

00:15:50.398 --> 00:15:52.008
after that we're going to get into some stretch

00:15:52.008 --> 00:15:52.328
goals.

00:15:52.328 --> 00:15:53.528
So I'm just going to kind of like,

00:15:54.088 --> 00:15:56.048
I'm going to point out a few different things that

00:15:56.048 --> 00:15:56.208
like,

00:15:56.208 --> 00:15:58.488
would actually make this a really hardened,

00:15:58.488 --> 00:15:59.688
production ready application.

00:15:59.688 --> 00:16:00.138
So like,

00:16:00.468 --> 00:16:00.948
you know,

00:16:00.948 --> 00:16:03.508
like actually being able to enforce the billing

00:16:03.508 --> 00:16:05.348
stuff in your application.

00:16:05.348 --> 00:16:05.708
So like,

00:16:05.708 --> 00:16:06.388
you could say like,

00:16:06.388 --> 00:16:06.708
oh,

00:16:06.708 --> 00:16:09.948
you can only run 15 evaluations if you're on the

00:16:09.948 --> 00:16:10.908
free tier or whatnot.

00:16:10.908 --> 00:16:11.108
Right.

00:16:11.108 --> 00:16:11.308
So,

00:16:11.308 --> 00:16:11.508
like,

00:16:11.508 --> 00:16:13.408
I'm going kind of point out some different stretch

00:16:13.408 --> 00:16:14.088
goals and you,

00:16:14.088 --> 00:16:15.808
on your own could go through and actually start

00:16:15.808 --> 00:16:17.928
really getting your hands dirty and implement some

00:16:17.928 --> 00:16:19.848
of these stretch goals to kind of further solidify

00:16:19.848 --> 00:16:21.568
your understanding of how to build on top of

00:16:21.568 --> 00:16:22.768
Cloudflare and how to,

00:16:23.008 --> 00:16:23.448
you know,

00:16:23.448 --> 00:16:23.648
like,

00:16:23.648 --> 00:16:25.345
actually build out an entire SaaS production.

