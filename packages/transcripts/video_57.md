WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.055 --> 00:00:00.455
All right,

00:00:00.455 --> 00:00:02.815
so now let's get to the fun part of the payments,

00:00:02.815 --> 00:00:05.655
which is actually creating the UI for it.

00:00:05.655 --> 00:00:08.455
So essentially what I want to happen is I want a

00:00:08.455 --> 00:00:10.135
page called Upgrade right here,

00:00:10.135 --> 00:00:11.495
which is currently not found.

00:00:12.125 --> 00:00:14.245
and I want that to have kind of like all of the

00:00:14.245 --> 00:00:15.805
pricing tiers and whatnot.

00:00:15.805 --> 00:00:16.205
So

00:00:16.525 --> 00:00:19.205
what we can do to begin with is if you have your

00:00:19.205 --> 00:00:20.445
application running,

00:00:20.445 --> 00:00:21.565
just head over to

00:00:22.315 --> 00:00:22.635
Routes

00:00:22.955 --> 00:00:23.355
app

00:00:23.675 --> 00:00:25.595
Auth and then we will just say

00:00:27.115 --> 00:00:28.635
upgrade tsx.

00:00:28.877 --> 00:00:31.069
That should spit out a dummy page for you here.

00:00:31.229 --> 00:00:34.509
So now you have this like dummy data that is

00:00:34.509 --> 00:00:35.109
currently here.

00:00:35.109 --> 00:00:37.709
So what we're going to do is we're going to coast

00:00:37.709 --> 00:00:39.709
through this because there's kind of a lot of code

00:00:39.709 --> 00:00:41.349
and I don't think it's really worth going into

00:00:41.349 --> 00:00:42.669
like every line of it.

00:00:42.669 --> 00:00:44.479
I'll just kind of COVID the really important

00:00:44.479 --> 00:00:44.959
stuff.

00:00:45.359 --> 00:00:46.879
So inside of components

00:00:47.469 --> 00:00:49.309
we're going to go ahead and say

00:00:50.829 --> 00:00:51.469
payment.

00:00:51.666 --> 00:00:53.866
So now that we have our payments folder,

00:00:53.866 --> 00:00:54.986
let's head over to Auth

00:00:55.386 --> 00:00:55.916
client

00:00:55.916 --> 00:00:56.505
T's.

00:00:56.666 --> 00:01:00.106
And then let's just pass in some plugins here so

00:01:00.186 --> 00:01:02.586
we can specify some additional configuration.

00:01:02.666 --> 00:01:04.906
So we can say plugins and then we're going to add

00:01:04.906 --> 00:01:06.986
the Stripe client as a plugin.

00:01:07.390 --> 00:01:10.350
We should be able to just import this directly

00:01:10.350 --> 00:01:12.270
from the better auth stripe.

00:01:12.830 --> 00:01:14.790
And essentially what that's going to do is that is

00:01:14.790 --> 00:01:16.670
going to take in subscriptions.

00:01:16.750 --> 00:01:17.190
True.

00:01:17.190 --> 00:01:19.870
Which is going to allow us to have to access the

00:01:19.870 --> 00:01:21.870
subscription API and I'll show you exactly what

00:01:21.870 --> 00:01:22.630
that's going to look like.

00:01:22.630 --> 00:01:24.750
So now let's head back over to our

00:01:25.150 --> 00:01:25.710
payments

00:01:25.970 --> 00:01:28.210
folder and we are going to be creating

00:01:29.090 --> 00:01:30.770
four different files into here.

00:01:31.030 --> 00:01:33.110
and those four files there will be three actual

00:01:33.110 --> 00:01:33.630
components.

00:01:33.630 --> 00:01:36.390
So the first one that we're going to create is a

00:01:37.064 --> 00:01:37.074
cancel

00:01:37.484 --> 00:01:38.724
subscription dialog,

00:01:38.724 --> 00:01:40.884
which basically is going to be a pop up if a user

00:01:40.884 --> 00:01:41.564
has a subscription.

00:01:41.564 --> 00:01:41.764
Well,

00:01:41.764 --> 00:01:42.324
they'll be more.

00:01:42.324 --> 00:01:44.444
Well they'll be able to actually cancel.

00:01:44.604 --> 00:01:46.924
So I'm just going to drop that code in really

00:01:46.924 --> 00:01:47.125
quick.

00:01:47.680 --> 00:01:50.600
So I'm just going to drop in the JS or the TSX for

00:01:50.600 --> 00:01:52.480
that and we're going to go over it in just a

00:01:52.480 --> 00:01:52.676
minute.

00:01:52.703 --> 00:01:54.703
The next file that we're going to create is called

00:01:54.703 --> 00:01:56.463
Subscription Status sidebar,

00:01:57.191 --> 00:01:57.911
tsx

00:01:59.111 --> 00:02:01.340
and this is going to be a little component that

00:02:01.340 --> 00:02:03.941
sits right here that kind of shows the user their

00:02:03.941 --> 00:02:04.381
subscription.

00:02:04.381 --> 00:02:05.141
If they don't have one,

00:02:05.141 --> 00:02:07.221
it will kind of prompt them to be able to upgrade.

00:02:07.221 --> 00:02:08.621
So we'll put in that code into here

00:02:08.864 --> 00:02:11.188
and then the last one is going to be the actual

00:02:11.188 --> 00:02:12.908
like upgrade page and,

00:02:12.979 --> 00:02:15.139
and these components are honestly a little bit

00:02:15.139 --> 00:02:15.899
dirty in my opinion.

00:02:15.899 --> 00:02:17.779
I would probably break this stuff up a little bit

00:02:17.779 --> 00:02:18.099
more.

00:02:18.359 --> 00:02:19.639
it's kind of a big file,

00:02:19.639 --> 00:02:20.039
but

00:02:20.439 --> 00:02:20.879
you know,

00:02:20.879 --> 00:02:22.439
like that's kind of beyond the point of this

00:02:22.439 --> 00:02:22.759
course.

00:02:23.799 --> 00:02:25.959
We just kind of want to like make sure all of this

00:02:25.959 --> 00:02:28.359
is working and get really familiar with the APIs

00:02:28.359 --> 00:02:29.799
and then you could come in,

00:02:30.039 --> 00:02:31.399
make this a little bit more modular.

00:02:31.399 --> 00:02:32.319
But to be totally frank,

00:02:32.319 --> 00:02:33.224
it's not that bad.

00:02:33.224 --> 00:02:35.086
And the last file that we're going to create is

00:02:35.086 --> 00:02:37.286
going to be index ts

00:02:40.096 --> 00:02:42.536
and that's just going to take the upgrade page and

00:02:42.536 --> 00:02:43.776
it's going to export it.

00:02:43.776 --> 00:02:44.176
Now,

00:02:44.466 --> 00:02:47.076
we can head over to the new page that was created,

00:02:47.076 --> 00:02:47.676
upgrade

00:02:48.236 --> 00:02:51.036
and delete this section and we're just going to

00:02:51.196 --> 00:02:52.876
import our upgrade page

00:02:54.578 --> 00:02:56.281
and then when this loads.

00:02:56.599 --> 00:02:59.959
So now you can see that we have these plans here.

00:03:00.199 --> 00:03:02.679
Now I know we just kind of copied and pasted stuff

00:03:02.679 --> 00:03:02.879
in.

00:03:02.879 --> 00:03:05.199
So like let's actually go through the API and

00:03:05.199 --> 00:03:06.119
what's happening here.

00:03:06.119 --> 00:03:06.308
So

00:03:06.312 --> 00:03:08.072
I'm going to go ahead and open a

00:03:08.392 --> 00:03:09.291
network tab

00:03:09.291 --> 00:03:11.612
and then let's start with our upgrade page.

00:03:11.692 --> 00:03:14.852
So what you're going to notice is we have these

00:03:14.852 --> 00:03:15.212
products

00:03:15.852 --> 00:03:17.772
and these products have these names

00:03:18.142 --> 00:03:20.702
and these names correspond to the names that we

00:03:20.702 --> 00:03:21.662
have in our

00:03:21.982 --> 00:03:24.262
backend application that we've configured into

00:03:24.262 --> 00:03:24.548
here.

00:03:25.532 --> 00:03:27.172
and then we've just kind of like added some

00:03:27.172 --> 00:03:29.492
additional features and like we have like pricing

00:03:29.492 --> 00:03:31.572
and whatnot and this is just hard coded in and

00:03:31.572 --> 00:03:33.612
then we have some markup down below

00:03:34.012 --> 00:03:36.052
where we just iterate through those plans and then

00:03:36.052 --> 00:03:38.012
we render these cards and that's what we're seeing

00:03:38.012 --> 00:03:38.253
here.

00:03:38.643 --> 00:03:40.923
now these prices are hard coded in the code base.

00:03:40.923 --> 00:03:42.443
If you were going to roll out your own SaaS

00:03:42.443 --> 00:03:42.643
product,

00:03:42.643 --> 00:03:43.643
you probably wouldn't do that.

00:03:43.643 --> 00:03:45.643
You'd probably have like a table and you'd have an

00:03:45.643 --> 00:03:46.643
API that

00:03:47.053 --> 00:03:47.253
provide,

00:03:47.323 --> 00:03:48.123
provides this,

00:03:48.203 --> 00:03:50.203
this configuration dynamically for you.

00:03:50.273 --> 00:03:52.103
but for this we just are going to hard code it

00:03:52.103 --> 00:03:53.423
because there's really no need to like

00:03:53.743 --> 00:03:56.023
go through so many extra steps when we really just

00:03:56.023 --> 00:03:57.663
want to understand the better Auth API.

00:03:57.663 --> 00:03:58.063
So

00:03:58.563 --> 00:04:00.803
from here what you're going to see is

00:04:01.122 --> 00:04:03.762
we are importing this Auth client

00:04:04.082 --> 00:04:06.562
and we have the plugin for the stripe client.

00:04:06.642 --> 00:04:07.042
So

00:04:08.372 --> 00:04:09.332
inside of this

00:04:09.732 --> 00:04:10.692
we have these git

00:04:11.102 --> 00:04:12.662
basically these buttons like Get Something,

00:04:12.662 --> 00:04:13.622
Get Get Basic,

00:04:13.622 --> 00:04:14.062
Get Pro,

00:04:14.062 --> 00:04:14.942
Get Enterprise.

00:04:15.964 --> 00:04:18.560
So you can see that we have right here Get Plan

00:04:18.640 --> 00:04:19.040
name

00:04:19.600 --> 00:04:20.000
and

00:04:20.728 --> 00:04:23.608
that is basically implementing this button and on

00:04:23.608 --> 00:04:25.368
click we're passing in the plan

00:04:26.088 --> 00:04:27.928
which is just kind of like the price,

00:04:28.328 --> 00:04:29.768
description features and whatnot.

00:04:29.768 --> 00:04:30.088
Right.

00:04:30.088 --> 00:04:31.608
And we are.

00:04:31.872 --> 00:04:34.352
And the handle upgrade is going to trigger

00:04:34.622 --> 00:04:37.552
this method which is taking our auth client and

00:04:37.552 --> 00:04:39.512
it's going to subscription and then it's calling

00:04:39.512 --> 00:04:40.072
upgrade.

00:04:40.072 --> 00:04:41.552
So if we don't have a subscription,

00:04:41.552 --> 00:04:44.552
this upgrade is going to essentially like

00:04:44.872 --> 00:04:47.492
redirect the user to a checkout page.

00:04:48.412 --> 00:04:50.092
and I'll show you kind of what that means,

00:04:50.252 --> 00:04:51.452
what that looks like in just a second.

00:04:51.452 --> 00:04:53.452
But you do provide a few additional things.

00:04:53.562 --> 00:04:56.032
we are getting this active subscription,

00:04:56.082 --> 00:04:56.942
subscription id.

00:04:57.432 --> 00:04:59.742
this is going to be undefined if the user doesn't

00:04:59.742 --> 00:05:01.202
have a subscription subscription and then we pass

00:05:01.202 --> 00:05:02.522
in some of these like

00:05:02.582 --> 00:05:05.762
redirect like on cancel on success on return.

00:05:05.762 --> 00:05:07.562
If you have different pages you want them to go to

00:05:07.562 --> 00:05:08.842
for these different types of events,

00:05:08.842 --> 00:05:09.122
we,

00:05:09.122 --> 00:05:10.002
you can go ahead and

00:05:10.352 --> 00:05:11.152
update that.

00:05:11.152 --> 00:05:13.072
But essentially we're just going to be redirecting

00:05:13.072 --> 00:05:14.352
them to upgrade page.

00:05:14.352 --> 00:05:15.472
So this page for now,

00:05:16.442 --> 00:05:19.722
now when this component loads for the very first

00:05:19.722 --> 00:05:19.990
time,

00:05:19.990 --> 00:05:23.001
essentially what we do is we call this load

00:05:23.001 --> 00:05:24.121
subscription method.

00:05:24.731 --> 00:05:24.971
And

00:05:25.291 --> 00:05:27.331
what that is going to do is that's going to go to

00:05:27.331 --> 00:05:29.971
our auth client subscription and then list and

00:05:29.971 --> 00:05:32.771
that's going to basically say show me the list of

00:05:32.771 --> 00:05:35.451
active subscriptions for this given user.

00:05:35.851 --> 00:05:37.851
And from there we just set that data

00:05:37.981 --> 00:05:40.351
into the set subscription state and that is going

00:05:40.351 --> 00:05:43.051
to be essentially what is our active subscription.

00:05:43.115 --> 00:05:45.715
So let's go ahead and look at some of the logic

00:05:45.715 --> 00:05:46.005
here.

00:05:46.025 --> 00:05:49.785
I'm actually going to log out console log

00:05:50.845 --> 00:05:53.325
data so you can see what the response looks like.

00:05:53.645 --> 00:05:56.325
But when this page loads for the first time you

00:05:56.325 --> 00:05:57.085
should see

00:05:57.468 --> 00:06:00.218
it does actually look like we have a little error

00:06:00.218 --> 00:06:00.378
here.

00:06:00.378 --> 00:06:02.458
So we're getting 500 requests when

00:06:02.858 --> 00:06:05.178
essentially we're trying to list out these

00:06:05.178 --> 00:06:05.818
subscriptions.

00:06:06.058 --> 00:06:09.258
And if you look at our logs the issue is kind of

00:06:09.258 --> 00:06:09.978
an oversight.

00:06:10.008 --> 00:06:12.518
from the last section essentially it's saying I

00:06:12.518 --> 00:06:14.718
can't find drizzle saying I can't find the

00:06:15.178 --> 00:06:16.138
subscriptions table.

00:06:16.138 --> 00:06:19.018
And the reason for that is because inside of our

00:06:19.018 --> 00:06:19.978
data ops,

00:06:20.638 --> 00:06:21.748
auth ts

00:06:22.308 --> 00:06:25.028
we're going to want to make sure we pass in the

00:06:25.028 --> 00:06:27.348
subscriptions table so we can basically say

00:06:27.908 --> 00:06:28.788
subscription.

00:06:29.160 --> 00:06:30.360
Make sure it's imported.

00:06:31.320 --> 00:06:32.520
Build it one more time.

00:06:33.020 --> 00:06:33.980
After we build

00:06:34.300 --> 00:06:36.700
essentially when we rerun this I suspect that

00:06:36.700 --> 00:06:37.940
we're not going to see that error.

00:06:37.940 --> 00:06:38.171
So

00:06:38.171 --> 00:06:38.391
alright.

00:06:38.391 --> 00:06:41.311
So you can see that this list API call is working.

00:06:41.391 --> 00:06:43.151
I'm not sure what this is right here.

00:06:43.251 --> 00:06:45.971
this is just some Google Image which is getting

00:06:45.971 --> 00:06:46.611
rate limited.

00:06:46.611 --> 00:06:47.371
Don't worry about that.

00:06:47.641 --> 00:06:49.921
we can look at our console and we don't have any

00:06:49.921 --> 00:06:50.281
data,

00:06:51.000 --> 00:06:52.921
so we don't have any subscriptions that are being

00:06:52.921 --> 00:06:56.001
called when the AUTH client is basically checking

00:06:56.001 --> 00:06:58.001
to see which subscriptions are available for the

00:06:58.001 --> 00:06:58.256
user.

00:06:58.386 --> 00:07:00.746
So now what we can do is we can actually go

00:07:00.746 --> 00:07:02.146
through this process of

00:07:02.386 --> 00:07:04.306
purchasing like products for,

00:07:04.386 --> 00:07:05.506
because this is test data,

00:07:05.506 --> 00:07:07.826
we can like see how this is going to work.

00:07:07.906 --> 00:07:09.146
But before we do that,

00:07:09.146 --> 00:07:10.706
if you take a look at the better,

00:07:10.866 --> 00:07:11.266
better,

00:07:11.596 --> 00:07:12.636
Auth docs,

00:07:13.242 --> 00:07:16.282
they have this command which is basically coming

00:07:16.282 --> 00:07:17.722
from the Stripe cli.

00:07:18.492 --> 00:07:21.772
essentially what it does is Stripe has the ability

00:07:21.772 --> 00:07:24.012
to give you web hooks whenever an event happens.

00:07:24.012 --> 00:07:25.932
So whenever a user buys something or cancels or

00:07:26.381 --> 00:07:27.421
wants a refund or whatever,

00:07:27.581 --> 00:07:28.701
a refund is issued,

00:07:28.701 --> 00:07:30.741
Stripe will send that data to a service that you

00:07:30.741 --> 00:07:31.341
configure.

00:07:31.581 --> 00:07:31.981
Now,

00:07:32.222 --> 00:07:33.901
essentially you have to like deploy a service,

00:07:33.981 --> 00:07:36.181
have an available URL in order to capture that and

00:07:36.181 --> 00:07:37.181
it makes testing very,

00:07:37.181 --> 00:07:37.461
very,

00:07:37.461 --> 00:07:38.301
very tedious.

00:07:38.461 --> 00:07:40.301
So they also have this

00:07:40.442 --> 00:07:42.161
the Stripe CLI which basically

00:07:42.641 --> 00:07:44.161
forwards requests,

00:07:44.501 --> 00:07:46.301
listens for requests and it forwards it to

00:07:46.701 --> 00:07:49.501
a specific like local host that you define here.

00:07:49.581 --> 00:07:51.421
So you can go ahead and copy this,

00:07:52.082 --> 00:07:55.362
come to a new terminal or just kind of like open a

00:07:55.362 --> 00:07:56.242
second terminal here.

00:07:56.302 --> 00:07:57.462
if you don't know how to do that,

00:07:57.462 --> 00:07:58.902
I'll just show you really quick.

00:07:59.362 --> 00:07:59.962
if you're using

00:08:00.602 --> 00:08:01.122
cursor,

00:08:01.122 --> 00:08:02.682
you can just hit this button right there.

00:08:03.282 --> 00:08:04.478
you can run Stripe listen

00:08:04.478 --> 00:08:06.897
and you're going to notice that this gives you a,

00:08:07.697 --> 00:08:07.817
A

00:08:07.877 --> 00:08:09.317
web hook signing secret.

00:08:09.637 --> 00:08:13.237
So we are going to go to our EMV file

00:08:13.557 --> 00:08:14.997
and then I'm going to say

00:08:15.317 --> 00:08:17.057
Stripe webhook key

00:08:22.772 --> 00:08:23.412
and then

00:08:24.632 --> 00:08:27.432
I'll kill the app and then pnpm run cf

00:08:27.752 --> 00:08:28.552
type gen

00:08:28.690 --> 00:08:29.969
and then start up the app again.

00:08:30.689 --> 00:08:32.489
Now in our Hono app,

00:08:32.489 --> 00:08:33.969
so in our app ts

00:08:34.369 --> 00:08:37.329
essentially here we can say EMV Stripe

00:08:38.029 --> 00:08:38.829
webhook key.

00:08:39.629 --> 00:08:41.669
And this is actually going to send real webhook

00:08:41.669 --> 00:08:43.629
events and we're going to be able to process them

00:08:43.629 --> 00:08:44.989
inside of our

00:08:45.159 --> 00:08:45.769
application.

00:08:45.769 --> 00:08:47.769
Now what's really cool about this is better AUTH

00:08:47.929 --> 00:08:50.889
takes care of like taking this Stripe webhook key,

00:08:51.369 --> 00:08:54.089
ensuring that the data that is being received by

00:08:54.089 --> 00:08:55.609
the web hook is indeed from Stripe.

00:08:55.609 --> 00:08:57.289
So it kind of like verifies that request,

00:08:57.639 --> 00:08:59.609
it gets the data and then it kind of like handles

00:08:59.609 --> 00:09:01.729
that data so it can update things on our back end.

00:09:01.729 --> 00:09:05.009
So we currently have a subscription table

00:09:06.219 --> 00:09:07.619
and there's going to be no data in the

00:09:07.619 --> 00:09:08.539
subscription table.

00:09:09.466 --> 00:09:12.746
Now what we can do is we can head over to,

00:09:12.996 --> 00:09:15.272
can head over to this dashboard and we're going to

00:09:15.272 --> 00:09:16.392
go through the process of,

00:09:17.272 --> 00:09:18.552
of actually like

00:09:18.952 --> 00:09:20.072
getting a subscription.

00:09:20.072 --> 00:09:20.832
But before we do that,

00:09:20.832 --> 00:09:22.072
I just want to make sure like,

00:09:22.072 --> 00:09:23.872
we have everything set up on the UI side.

00:09:23.872 --> 00:09:25.392
So there is one component,

00:09:25.392 --> 00:09:27.712
like I want a little card here that shows if the

00:09:27.712 --> 00:09:28.952
user subscribed or not.

00:09:30.222 --> 00:09:32.382
so if we head over to the

00:09:32.782 --> 00:09:33.262
Nav

00:09:34.142 --> 00:09:34.782
user,

00:09:35.022 --> 00:09:37.262
essentially it is under the common,

00:09:37.542 --> 00:09:39.822
it's under the common folder and it's basically

00:09:39.822 --> 00:09:40.382
this like,

00:09:40.382 --> 00:09:41.622
nav section right here.

00:09:42.022 --> 00:09:44.982
And we head over to the sidebar item,

00:09:45.382 --> 00:09:47.382
I think we can just paste it in right here.

00:09:49.050 --> 00:09:50.330
Stripe subscription bar.

00:09:52.396 --> 00:09:54.076
And we should see this pop up here.

00:09:54.076 --> 00:09:55.756
So if we were at this dashboard,

00:09:56.036 --> 00:09:58.076
we could just click this guy and come to this

00:09:58.076 --> 00:09:58.436
page.

00:09:58.436 --> 00:09:58.830
Now

00:09:58.883 --> 00:10:01.043
you can ignore these websocket failures for now

00:10:01.043 --> 00:10:03.363
just because we're developing locally and it's not

00:10:03.443 --> 00:10:05.523
currently configured to be able to reach out to

00:10:05.863 --> 00:10:06.263
Stage.

00:10:06.503 --> 00:10:06.903
But

00:10:07.543 --> 00:10:09.383
let's head over to our network tab

00:10:09.703 --> 00:10:12.143
and then let's see what happens when we go through

00:10:12.143 --> 00:10:13.023
the process of

00:10:13.023 --> 00:10:14.303
getting a subscription.

00:10:14.303 --> 00:10:15.438
So if we say get basic,

00:10:15.978 --> 00:10:17.378
you're going to notice this comes over to the

00:10:17.378 --> 00:10:18.338
Stripe payment page.

00:10:18.338 --> 00:10:19.378
Now there's a lot of ways to do it.

00:10:19.378 --> 00:10:21.378
This is definitely the easiest and most common way

00:10:21.378 --> 00:10:22.738
I'm seeing people like take payments.

00:10:22.738 --> 00:10:24.658
You can embed this in your website,

00:10:24.658 --> 00:10:26.898
but you could also just kind of like link out to

00:10:26.898 --> 00:10:27.298
Stripe.

00:10:27.298 --> 00:10:30.538
Now this page is entirely configurable inside the

00:10:30.538 --> 00:10:31.498
Stripe dashboard.

00:10:31.498 --> 00:10:32.938
Just you can kind of note that,

00:10:33.228 --> 00:10:34.448
and if you're going to,

00:10:34.848 --> 00:10:37.488
if you're going to like do a test card payment,

00:10:37.808 --> 00:10:39.668
you can use the stripes,

00:10:40.658 --> 00:10:41.978
Stripe's fake card,

00:10:41.978 --> 00:10:44.258
which is 424-242-4242.

00:10:44.681 --> 00:10:48.481
And then you can put in a date in the future and a

00:10:48.481 --> 00:10:49.721
random cvc.

00:10:50.271 --> 00:10:51.781
you can fill out whatever name you want and

00:10:51.781 --> 00:10:52.301
whatnot.

00:10:52.461 --> 00:10:54.181
And then what you're going to notice is we're

00:10:54.181 --> 00:10:55.087
going to go subscribe.

00:10:55.589 --> 00:10:58.989
That should redirect us back to our app Forward

00:10:58.989 --> 00:10:59.749
slash upgrade.

00:10:59.749 --> 00:11:01.109
So back to this payment page

00:11:01.599 --> 00:11:03.519
and you're going to notice we now have this

00:11:03.719 --> 00:11:05.529
we now have this Basic,

00:11:05.529 --> 00:11:07.529
essentially we have this basic that is

00:11:08.089 --> 00:11:09.609
highlighted as the current plan.

00:11:09.929 --> 00:11:12.769
And on this side over here we have Basic selected

00:11:12.769 --> 00:11:13.857
as our subscription.

00:11:14.440 --> 00:11:17.600
And if you look at the console you should see that

00:11:17.600 --> 00:11:18.120
we also

00:11:18.440 --> 00:11:20.040
were console logging out these.

00:11:20.120 --> 00:11:22.480
So it's going to show us the actual plan that we

00:11:22.480 --> 00:11:24.440
have subscribed to and some

00:11:24.950 --> 00:11:27.310
information like the price ID and the subscription

00:11:27.310 --> 00:11:28.990
ID and whatnot and the customer id.

00:11:28.990 --> 00:11:30.704
So it's passing that back to the UI.

00:11:30.704 --> 00:11:32.253
Now it's really nice about Stripe and the way

00:11:32.253 --> 00:11:35.093
better has this configured is you can essentially

00:11:35.093 --> 00:11:38.573
say okay if I am on this current plan and I want

00:11:38.573 --> 00:11:41.053
to upgrade to the Most popular plan,

00:11:41.053 --> 00:11:42.293
$25 a month,

00:11:42.533 --> 00:11:44.213
you can walk through this logic as.

00:11:44.545 --> 00:11:46.945
And what you're probably going to notice is you

00:11:46.945 --> 00:11:50.225
get this little pop up error and if we come into

00:11:50.225 --> 00:11:53.345
the request you'll be able to see more about why

00:11:53.345 --> 00:11:54.385
we're getting this error.

00:11:54.385 --> 00:11:54.785
So

00:11:54.995 --> 00:11:55.955
inside of upgrade

00:11:55.955 --> 00:11:57.853
if you come to the response you're going to,

00:11:57.853 --> 00:11:59.653
you're going to notice it says no configuration

00:11:59.653 --> 00:12:02.413
provided and the test default mode configuration

00:12:02.413 --> 00:12:03.293
has not been created.

00:12:03.533 --> 00:12:04.333
Please provide

00:12:05.223 --> 00:12:07.583
or create your default customer blah blah blah.

00:12:07.583 --> 00:12:08.503
And then it basically says

00:12:09.313 --> 00:12:11.673
you can do this in the dash link in the Stripe

00:12:11.673 --> 00:12:12.273
dashboard

00:12:13.053 --> 00:12:14.253
billing portal.

00:12:14.253 --> 00:12:17.093
So all this is going to want us to do is literally

00:12:17.093 --> 00:12:17.453
just

00:12:18.485 --> 00:12:20.125
basically inside of the customer portal.

00:12:20.125 --> 00:12:21.685
It's just going to want us to,

00:12:21.824 --> 00:12:23.758
it should just want us to actually just save these

00:12:23.758 --> 00:12:24.638
changes here.

00:12:24.878 --> 00:12:26.318
Now we can come back over.

00:12:26.798 --> 00:12:28.238
I suspect this should work.

00:12:28.238 --> 00:12:29.598
After saving those changes

00:12:29.826 --> 00:12:32.706
looks like your subscriptions cannot be updated

00:12:32.706 --> 00:12:35.186
because the subscription feature in the portal is,

00:12:35.186 --> 00:12:36.296
is disable.

00:12:36.846 --> 00:12:37.086
So

00:12:37.326 --> 00:12:39.326
we could come into here and it looks like there's

00:12:39.326 --> 00:12:41.246
going to be a section under subscriptions.

00:12:41.566 --> 00:12:43.326
Essentially what you're going to do is you're

00:12:43.326 --> 00:12:45.966
going to enable the user to be able to switch

00:12:45.966 --> 00:12:46.573
plans.

00:12:46.573 --> 00:12:47.630
go ahead and hit save

00:12:47.699 --> 00:12:48.099
and

00:12:48.392 --> 00:12:50.682
you have to select which products these apply to.

00:12:50.682 --> 00:12:52.762
So we're just going to select all three of these

00:12:52.762 --> 00:12:53.082
products

00:12:54.029 --> 00:12:54.616
save changes

00:12:54.616 --> 00:12:57.087
and now we can go ahead and hit this and it should

00:12:57.087 --> 00:13:00.047
redirect us to a change subscription page.

00:13:00.047 --> 00:13:01.897
So basically here it's going to show the

00:13:02.157 --> 00:13:03.597
subscription that we're going to.

00:13:03.757 --> 00:13:06.197
And if you were to actually fill out a description

00:13:06.197 --> 00:13:06.717
for this product,

00:13:06.717 --> 00:13:08.397
there would be more information that shows here.

00:13:08.397 --> 00:13:10.837
But basically it's going to prorate this for us.

00:13:10.837 --> 00:13:12.157
So we've already paid $9,

00:13:12.557 --> 00:13:13.677
so it's going to prorate.

00:13:13.677 --> 00:13:14.797
Amount due today is 16.

00:13:15.357 --> 00:13:17.026
We're going to go ahead and confirm that.

00:13:17.487 --> 00:13:19.567
And then this should redirect us again back to

00:13:19.567 --> 00:13:19.887
the,

00:13:20.527 --> 00:13:21.327
this page.

00:13:21.647 --> 00:13:23.527
And what you're going to notice is we should be

00:13:23.527 --> 00:13:25.087
also receiving these web hooks,

00:13:25.668 --> 00:13:26.439
throughout this process.

00:13:26.599 --> 00:13:26.893
So

00:13:27.063 --> 00:13:29.177
now what I'm actually noticing is,

00:13:30.087 --> 00:13:32.567
it didn't switch payments for me or didn't switch

00:13:32.567 --> 00:13:33.327
the plans for me.

00:13:33.327 --> 00:13:34.327
And the reason why

00:13:34.647 --> 00:13:35.447
is currently

00:13:36.337 --> 00:13:38.737
the stripe webhooks are not sending to this or

00:13:38.737 --> 00:13:40.337
they're not currently sending to

00:13:40.487 --> 00:13:41.617
this application because

00:13:42.097 --> 00:13:43.457
I was using a different

00:13:43.777 --> 00:13:45.697
stripe Dashboard or a different,

00:13:45.777 --> 00:13:46.377
stripe account.

00:13:46.857 --> 00:13:48.777
So if you have multiple stripe accounts,

00:13:48.777 --> 00:13:49.657
you can just run

00:13:49.977 --> 00:13:50.617
stripe

00:13:51.097 --> 00:13:51.817
logout

00:13:52.445 --> 00:13:53.085
and then,

00:13:53.365 --> 00:13:54.785
when you run the CLI again.

00:13:54.785 --> 00:13:56.425
So if you're running it for the first time as

00:13:56.425 --> 00:13:56.665
well,

00:13:56.665 --> 00:13:58.305
what you're probably going to notice is

00:13:58.625 --> 00:14:00.385
it's going to want you to open this,

00:14:01.045 --> 00:14:02.005
this web page

00:14:02.325 --> 00:14:04.085
and this is just going to authenticate,

00:14:04.185 --> 00:14:06.105
your stripe account as well and store the

00:14:06.105 --> 00:14:07.145
necessary tokens.

00:14:07.145 --> 00:14:09.785
And it's probably going to also like send you an

00:14:09.785 --> 00:14:10.343
sms.

00:14:11.264 --> 00:14:11.784
All right,

00:14:11.784 --> 00:14:13.104
so once that is done,

00:14:14.044 --> 00:14:15.164
it should generate.

00:14:15.564 --> 00:14:16.084
It'll.

00:14:16.084 --> 00:14:17.804
I'm going to go ahead and run this again.

00:14:18.016 --> 00:14:20.176
So it's actually going to give me a different key.

00:14:20.656 --> 00:14:21.936
So if I head over to

00:14:22.336 --> 00:14:22.976
emv,

00:14:23.555 --> 00:14:25.395
it's going to give me.

00:14:25.715 --> 00:14:27.835
I'm going to replace my key because this is

00:14:27.835 --> 00:14:28.435
actually the

00:14:28.755 --> 00:14:29.555
incorrect key.

00:14:30.355 --> 00:14:30.875
All right,

00:14:30.875 --> 00:14:32.355
so now we should be cooking.

00:14:32.835 --> 00:14:32.905
We

00:14:32.975 --> 00:14:35.535
can come into here and we are going to go through

00:14:35.535 --> 00:14:37.575
the process of trying to upgrade our

00:14:37.895 --> 00:14:38.295
plan

00:14:39.095 --> 00:14:40.535
and we should see web,

00:14:40.685 --> 00:14:42.745
we should see webhook events flow through into

00:14:42.745 --> 00:14:42.960
here.

00:14:43.263 --> 00:14:44.463
So let's go ahead and

00:14:44.783 --> 00:14:46.833
go through that upgrade process one more time.

00:14:47.343 --> 00:14:47.663
Oh,

00:14:48.143 --> 00:14:48.623
all right.

00:14:48.623 --> 00:14:51.143
So now the issue is because I didn't have webhook

00:14:51.143 --> 00:14:52.383
set up properly,

00:14:52.543 --> 00:14:54.303
my data is now out of sync.

00:14:54.303 --> 00:14:56.063
So what I'm gonna end up doing,

00:14:56.303 --> 00:14:58.503
and this is just a good thing to kind of flesh out

00:14:58.503 --> 00:14:59.943
while you're testing because doing this in

00:14:59.943 --> 00:15:01.983
production would be pretty tedious.

00:15:02.143 --> 00:15:02.943
This is also why

00:15:03.263 --> 00:15:04.783
payments can be kind of difficult.

00:15:05.423 --> 00:15:05.433
I'm

00:15:05.603 --> 00:15:08.283
just gonna go ahead and delete from subscriptions,

00:15:08.283 --> 00:15:09.763
so I'm gonna clear out this data.

00:15:12.122 --> 00:15:13.962
So we shouldn't have any subscriptions in here.

00:15:14.442 --> 00:15:15.962
Head back over to this page.

00:15:17.312 --> 00:15:19.672
and we should notice that this is also going to

00:15:19.672 --> 00:15:20.432
show up as

00:15:21.172 --> 00:15:21.772
basic.

00:15:21.772 --> 00:15:22.932
So I'm going to go through this process,

00:15:22.932 --> 00:15:24.132
I'm going to buy basic,

00:15:25.065 --> 00:15:26.264
go through the upgrade process.

00:15:26.962 --> 00:15:28.783
And what you're going to notice here is we're

00:15:28.783 --> 00:15:30.395
getting all these webhook events.

00:15:30.974 --> 00:15:33.294
I do notice that we have an error in our

00:15:33.294 --> 00:15:35.734
application thrown by better auth that it can't

00:15:35.734 --> 00:15:37.534
read the property of id.

00:15:38.014 --> 00:15:39.804
So we'll keep on lookout for that.

00:15:39.804 --> 00:15:41.354
this is actually a bit curious to me.

00:15:41.694 --> 00:15:44.094
but let's go ahead and finish this process.

00:15:44.254 --> 00:15:46.014
Try to upgrade this page

00:15:46.414 --> 00:15:46.934
or this,

00:15:46.934 --> 00:15:47.534
this product.

00:15:47.801 --> 00:15:48.061
right,

00:15:48.061 --> 00:15:50.561
so now you can see that this shows that we

00:15:50.945 --> 00:15:54.145
it actually shows that we don't have a

00:15:54.145 --> 00:15:55.425
subscription plan here.

00:15:55.425 --> 00:15:57.324
What I'm actually going to do here is I'm going to

00:15:57.324 --> 00:15:58.125
start clean,

00:15:58.125 --> 00:15:59.965
I'm going to sign out and I'm going to log in with

00:15:59.965 --> 00:16:00.645
a different email,

00:16:00.785 --> 00:16:02.525
just because I think I might have messed up the

00:16:03.135 --> 00:16:05.095
users table and that mapping.

00:16:05.095 --> 00:16:06.815
So I'm going to log in with this email.

00:16:07.409 --> 00:16:09.009
Let's go ahead and upgrade to Pro.

00:16:09.261 --> 00:16:10.102
Let's get basic.

00:16:10.317 --> 00:16:11.837
I'm going to go ahead and do

00:16:12.557 --> 00:16:13.357
Cash app

00:16:14.157 --> 00:16:16.197
because you can kind of test all these different

00:16:16.197 --> 00:16:16.797
kinds.

00:16:16.797 --> 00:16:17.013
So

00:16:17.013 --> 00:16:19.350
think it's going to want me to simulate a scan

00:16:19.509 --> 00:16:20.429
authorized test payment.

00:16:21.283 --> 00:16:21.803
Alright,

00:16:21.803 --> 00:16:23.763
so now we're on the current plan.

00:16:24.022 --> 00:16:26.359
We got this web hook and we successfully processed

00:16:26.359 --> 00:16:26.519
it.

00:16:26.519 --> 00:16:27.959
Let's go ahead and change to Pro

00:16:28.689 --> 00:16:29.329
Upgrade.

00:16:29.329 --> 00:16:30.889
We're going to pay $16.

00:16:30.889 --> 00:16:32.849
So it's going to prorate this for us

00:16:33.461 --> 00:16:33.701
now.

00:16:33.781 --> 00:16:34.341
Look at that.

00:16:34.341 --> 00:16:34.661
Boom.

00:16:34.661 --> 00:16:35.021
Okay,

00:16:35.021 --> 00:16:36.021
so that worked as expected.

00:16:36.101 --> 00:16:36.981
So we got the

00:16:37.361 --> 00:16:39.921
hook for that as well to basically say that it was

00:16:39.921 --> 00:16:40.961
upgrade updated

00:16:41.281 --> 00:16:43.681
and then it was able to reflect the current plan.

00:16:43.841 --> 00:16:46.361
So if we come over to subscriptions you're going

00:16:46.361 --> 00:16:48.401
to notice we're going to have this user

00:16:48.841 --> 00:16:49.921
now part of the Pro plan.

00:16:49.921 --> 00:16:52.961
Let's upgrade one more time and go to Enterprise.

00:16:54.014 --> 00:16:55.774
It's also prorating it again.

00:16:57.175 --> 00:16:57.462
cool.

00:16:57.462 --> 00:16:59.022
I'm just gonna head back here.

00:16:59.182 --> 00:16:59.542
All right,

00:16:59.542 --> 00:16:59.862
there we go.

00:16:59.862 --> 00:17:01.062
So now this is our current plan.

00:17:01.062 --> 00:17:02.262
Those webhooks were processed.

00:17:02.262 --> 00:17:03.851
So it looks like I actually screwed up the

00:17:03.851 --> 00:17:06.342
mapping because I did some configurations wrong,

00:17:06.342 --> 00:17:08.862
which is really why you want to flush out payments

00:17:09.022 --> 00:17:11.102
well before you release this to users because

00:17:11.422 --> 00:17:12.622
there's so much to it.

00:17:12.952 --> 00:17:13.432
but yeah,

00:17:13.432 --> 00:17:15.152
if you're going to just have like a basic

00:17:15.152 --> 00:17:16.472
subscription tier kind of a thing,

00:17:16.472 --> 00:17:18.672
I think better off makes it easier than rolling it

00:17:18.672 --> 00:17:19.072
on your own.

00:17:19.072 --> 00:17:20.732
But there's still a lot of things to consider

00:17:20.732 --> 00:17:21.092
here.

00:17:21.332 --> 00:17:21.892
All right,

00:17:22.292 --> 00:17:24.732
so now what we're going to notice is inside of

00:17:24.732 --> 00:17:25.332
payments

00:17:25.435 --> 00:17:26.227
we have this

00:17:26.487 --> 00:17:28.927
cancel subscription dialog which basically is

00:17:28.927 --> 00:17:30.967
saying if the current plan is selected,

00:17:31.987 --> 00:17:33.666
you can click on current plan.

00:17:33.666 --> 00:17:36.947
You get this dialog which pops up this component

00:17:36.947 --> 00:17:38.267
for canceling the subscription.

00:17:38.267 --> 00:17:39.587
And essentially we have this

00:17:40.067 --> 00:17:41.987
handler that's going to be implemented when you

00:17:41.987 --> 00:17:42.707
click this button.

00:17:43.277 --> 00:17:43.517
And

00:17:44.047 --> 00:17:45.167
it's just calling

00:17:46.077 --> 00:17:47.877
auth client subscription cancel.

00:17:47.877 --> 00:17:48.159
And then

00:17:48.159 --> 00:17:49.553
better off is going to take care of actually

00:17:49.553 --> 00:17:51.553
canceling the subscription inside of

00:17:51.813 --> 00:17:53.743
Stripe and then also updating that in the

00:17:53.743 --> 00:17:54.223
database.

00:17:54.223 --> 00:17:54.583
So,

00:17:54.823 --> 00:17:57.723
take a look here we have cancel period ends,

00:17:57.723 --> 00:17:59.723
which is going to be zero for false.

00:18:00.273 --> 00:18:01.953
we're going to have our.

00:18:02.433 --> 00:18:03.953
Let's go to our customers,

00:18:04.029 --> 00:18:06.007
we'll go to this user and you're going to notice

00:18:06.007 --> 00:18:08.087
that we're currently on the enterprise product.

00:18:08.087 --> 00:18:09.887
That's our current subscription at the moment.

00:18:11.597 --> 00:18:12.868
now I'm going to go ahead and cancel it.

00:18:12.868 --> 00:18:14.828
It's going to take me to a Stripe page.

00:18:15.468 --> 00:18:15.868
And

00:18:16.278 --> 00:18:17.848
inside of the Stripe page you're going to go ahead

00:18:17.848 --> 00:18:19.568
and do that cancellation and whatnot.

00:18:19.808 --> 00:18:21.728
And it's probably going to ask you why.

00:18:21.808 --> 00:18:22.608
Too expensive.

00:18:22.911 --> 00:18:23.471
Okay,

00:18:23.471 --> 00:18:23.696
cool.

00:18:23.981 --> 00:18:24.381
So

00:18:24.781 --> 00:18:25.181
now

00:18:25.428 --> 00:18:26.588
we can reload this page.

00:18:27.348 --> 00:18:29.748
I think this goes to the actual Stripe account

00:18:29.748 --> 00:18:30.278
button.

00:18:30.694 --> 00:18:31.174
all right,

00:18:31.174 --> 00:18:33.494
so now you see that we have this canceling period

00:18:33.494 --> 00:18:33.894
at

00:18:34.304 --> 00:18:36.214
it shows that this is going to be canceled.

00:18:36.534 --> 00:18:37.174
And then

00:18:37.574 --> 00:18:38.374
additionally,

00:18:39.100 --> 00:18:41.390
in this database we can go ahead and look and

00:18:41.490 --> 00:18:43.970
better off said this subscription is going to

00:18:43.970 --> 00:18:44.330
cancel.

00:18:44.330 --> 00:18:46.650
Now we also have the ability to say we want to

00:18:46.650 --> 00:18:49.090
reinstate the subscription so we can go to manage

00:18:49.090 --> 00:18:49.610
subscription.

00:18:49.610 --> 00:18:50.930
And then you're going to see that we have this

00:18:50.930 --> 00:18:51.410
restore,

00:18:52.010 --> 00:18:52.826
subscription button.

00:18:53.665 --> 00:18:55.985
So essentially there's another helper function.

00:18:56.105 --> 00:18:57.805
if the state is canceled,

00:18:58.045 --> 00:19:00.405
where the user can restore by saying auth client

00:19:00.405 --> 00:19:01.485
subscription restore.

00:19:01.645 --> 00:19:03.565
And that's going to take you through a very.

00:19:03.565 --> 00:19:04.885
Essentially that's not going to take you through

00:19:04.885 --> 00:19:05.725
the process of

00:19:06.685 --> 00:19:08.285
going to an actual Stripe page.

00:19:08.365 --> 00:19:09.965
It should just ping the

00:19:10.225 --> 00:19:12.305
API and then programmatically they're just going

00:19:12.305 --> 00:19:13.105
to restore that.

00:19:13.345 --> 00:19:14.785
So now we're restored.

00:19:14.785 --> 00:19:16.665
And you should see that we're getting these web

00:19:16.665 --> 00:19:18.015
hosts hook events as well,

00:19:18.335 --> 00:19:19.565
pretty instantaneously.

00:19:19.575 --> 00:19:19.975
so yeah,

00:19:19.975 --> 00:19:21.095
so now that's the current plan.

00:19:21.095 --> 00:19:22.455
So in a nutshell,

00:19:22.455 --> 00:19:23.255
that is

00:19:24.465 --> 00:19:26.065
integrating Stripe with better auth.

00:19:26.065 --> 00:19:26.985
Now there's like,

00:19:26.985 --> 00:19:27.545
as you could tell,

00:19:27.545 --> 00:19:28.705
there's a lot to it and

00:19:29.105 --> 00:19:29.505
you know,

00:19:29.505 --> 00:19:31.224
there's a lot of different areas that you could,

00:19:31.224 --> 00:19:31.505
like,

00:19:31.505 --> 00:19:32.065
mess up on.

00:19:32.065 --> 00:19:32.585
So you have to,

00:19:32.585 --> 00:19:32.825
like,

00:19:32.825 --> 00:19:33.145
really,

00:19:33.145 --> 00:19:34.945
really test out your subscription,

00:19:35.015 --> 00:19:35.725
process and,

00:19:35.725 --> 00:19:36.085
like,

00:19:36.085 --> 00:19:38.565
system and then also really ensure that you know

00:19:38.565 --> 00:19:39.205
what's happening.

00:19:39.205 --> 00:19:39.565
Because,

00:19:39.885 --> 00:19:40.285
you know,

00:19:40.285 --> 00:19:41.565
if you get billing wrong,

00:19:41.565 --> 00:19:42.165
it could really,

00:19:42.165 --> 00:19:42.525
like,

00:19:42.785 --> 00:19:43.065
you know,

00:19:43.065 --> 00:19:44.905
it could really be not good for customers,

00:19:44.905 --> 00:19:46.305
especially if you're overcharging,

00:19:46.335 --> 00:19:48.335
or you have a user that has,

00:19:48.335 --> 00:19:48.495
like,

00:19:48.495 --> 00:19:49.857
more than one subscription and whatnot.

00:19:49.857 --> 00:19:50.472
Now there are,

00:19:50.472 --> 00:19:50.712
like,

00:19:50.712 --> 00:19:52.392
configurations in the Stripe dashboard that you

00:19:52.392 --> 00:19:52.792
can say like,

00:19:52.792 --> 00:19:52.992
oh,

00:19:52.992 --> 00:19:54.632
I only want one customer to ever have one

00:19:54.632 --> 00:19:56.192
subscription at a given point in time.

00:19:56.192 --> 00:19:56.472
So,

00:19:56.472 --> 00:19:56.632
like,

00:19:56.632 --> 00:19:57.792
there are some things you can do.

00:19:57.792 --> 00:19:59.192
But I would say just like,

00:19:59.192 --> 00:20:00.392
dive really deep into the docs.

00:20:00.392 --> 00:20:02.312
If you're going to roll out payments to users and

00:20:02.312 --> 00:20:03.152
you can use better auth,

00:20:03.152 --> 00:20:04.942
you can go ahead and do it this way.

00:20:04.942 --> 00:20:05.932
it should work just fine.

00:20:05.932 --> 00:20:07.612
But the second you go past,

00:20:07.612 --> 00:20:07.892
like,

00:20:07.892 --> 00:20:09.932
really basic subscription tiers is when you have

00:20:09.932 --> 00:20:10.372
to actually,

00:20:10.372 --> 00:20:10.652
like,

00:20:10.652 --> 00:20:10.972
start

00:20:11.282 --> 00:20:11.442
getting

00:20:11.752 --> 00:20:13.974
diving very deep into the Stripe API.

00:20:14.017 --> 00:20:14.417
Now,

00:20:14.417 --> 00:20:16.737
before we wrap up the,

00:20:17.207 --> 00:20:18.967
before we wrap up the

00:20:20.347 --> 00:20:20.867
section of this,

00:20:20.867 --> 00:20:22.907
we're gonna have one additional video where we're

00:20:22.907 --> 00:20:24.387
going to deploy this and just make sure

00:20:24.387 --> 00:20:25.307
everything's configured.

00:20:25.307 --> 00:20:25.627
Now,

00:20:25.627 --> 00:20:27.467
I'm not going to be deploying this to production

00:20:27.467 --> 00:20:29.627
because I don't want to actually go create a real

00:20:29.627 --> 00:20:31.067
stripe account for this fake product.

00:20:31.507 --> 00:20:33.187
we're just going to be doing this in stage,

00:20:33.187 --> 00:20:35.307
so we'll be able to see how to actually configure

00:20:35.307 --> 00:20:36.151
the web hooks.

