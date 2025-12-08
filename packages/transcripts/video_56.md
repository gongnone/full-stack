WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.311 --> 00:00:02.871
So now let's integrate payments into our SaaS

00:00:02.871 --> 00:00:03.191
product.

00:00:03.271 --> 00:00:05.631
Now payments is kind of a topic that I went back

00:00:05.631 --> 00:00:06.391
and forth with,

00:00:07.131 --> 00:00:09.651
deciding if I actually wanted to put into this

00:00:09.651 --> 00:00:12.290
course just because it is such a broad topic and

00:00:12.290 --> 00:00:14.251
honestly it can become so complex

00:00:14.531 --> 00:00:17.731
as your use cases mature and become more niche.

00:00:17.811 --> 00:00:18.211
So

00:00:18.691 --> 00:00:21.051
just note that this is going to be a pretty simple

00:00:21.051 --> 00:00:22.651
implementation of Stripe.

00:00:22.651 --> 00:00:24.291
Essentially what we're going to be doing is we're

00:00:24.291 --> 00:00:26.131
going to be using the better off plugin

00:00:26.421 --> 00:00:28.181
to roll out Stripe subscriptions.

00:00:28.181 --> 00:00:31.741
Now this is kind of a valid way of like actually

00:00:31.741 --> 00:00:33.541
taking payments for the vast majority of these

00:00:33.541 --> 00:00:34.341
like SaaS products,

00:00:34.671 --> 00:00:35.711
even larger products.

00:00:35.711 --> 00:00:37.871
This is a pretty like standard implementation.

00:00:37.871 --> 00:00:40.351
But the second you're getting into like usage

00:00:40.351 --> 00:00:41.151
based billing,

00:00:41.341 --> 00:00:43.251
or you have like multiple different products and

00:00:43.571 --> 00:00:46.451
you need a lot more control over the entire like

00:00:46.451 --> 00:00:47.171
payment system,

00:00:47.491 --> 00:00:50.211
I feel like rolling your own solution is kind of

00:00:50.211 --> 00:00:51.811
the direction you have to go and we just don't

00:00:51.811 --> 00:00:53.531
have that type of time to go over that in the

00:00:53.531 --> 00:00:53.731
course.

00:00:53.731 --> 00:00:56.451
Now I do kind of want to like build out a course

00:00:56.871 --> 00:00:57.751
dedicated to just

00:00:58.151 --> 00:01:01.191
advanced payment implementations inside of a SaaS

00:01:01.351 --> 00:01:01.751
service.

00:01:01.831 --> 00:01:03.391
Now that's a pretty niche topic.

00:01:03.391 --> 00:01:05.111
So do let me know if that's something that you'd

00:01:05.111 --> 00:01:05.911
be interested in.

00:01:05.911 --> 00:01:07.951
So for this section of the course we're going to

00:01:07.951 --> 00:01:08.711
keep it pretty simple.

00:01:08.711 --> 00:01:09.271
But even

00:01:09.591 --> 00:01:10.551
even though it's simple,

00:01:10.551 --> 00:01:11.991
there's still a lot of things that you kind of

00:01:11.991 --> 00:01:13.031
have to like keep in your head.

00:01:13.031 --> 00:01:15.231
I do think this information will kind of create a

00:01:15.231 --> 00:01:17.271
foundation if you haven't implemented payments

00:01:17.271 --> 00:01:19.991
before to know enough to start building upon.

00:01:19.991 --> 00:01:20.991
So it will be useful.

00:01:20.991 --> 00:01:21.991
But this section is

00:01:22.041 --> 00:01:23.251
optional like this.

00:01:23.401 --> 00:01:24.921
The rest of the course you'll be able to do

00:01:24.921 --> 00:01:25.881
everything that you're

00:01:26.251 --> 00:01:26.531
like,

00:01:26.531 --> 00:01:27.771
you'll be able to like follow along with the

00:01:27.771 --> 00:01:29.451
course if you skip payments altogether.

00:01:29.451 --> 00:01:30.971
So it is okay if you want to skip it.

00:01:31.271 --> 00:01:33.331
but essentially what we're going to be doing is if

00:01:33.331 --> 00:01:34.411
you come over to better off,

00:01:34.411 --> 00:01:36.491
there's this section called third party plugins

00:01:36.491 --> 00:01:38.211
and essentially we have Stripe.

00:01:38.211 --> 00:01:38.460
Now

00:01:38.460 --> 00:01:41.717
this plugin notes that like the benefits of this

00:01:41.717 --> 00:01:42.797
plugin is one,

00:01:42.797 --> 00:01:46.437
it helps us create a Stripe customer when a user

00:01:46.437 --> 00:01:46.877
signs up.

00:01:46.877 --> 00:01:48.637
And the reason why that's like really nice is

00:01:48.637 --> 00:01:48.957
because

00:01:49.497 --> 00:01:52.977
Stripe has their own like customer API where it

00:01:52.977 --> 00:01:55.397
doesn't like map one to one to an email or a phone

00:01:55.397 --> 00:01:55.597
number.

00:01:55.597 --> 00:01:57.997
Like the same email can have dozens and dozens of

00:01:57.997 --> 00:01:58.837
Stripe customers.

00:01:58.837 --> 00:02:01.797
So kind of like keeping this is your user and this

00:02:01.797 --> 00:02:04.237
is their assigned customer ID is a tedious thing

00:02:04.237 --> 00:02:04.597
to do.

00:02:04.607 --> 00:02:06.877
and this plugin takes care of that for us.

00:02:06.877 --> 00:02:09.437
And we can basically say when a user

00:02:09.757 --> 00:02:11.877
signs up for the very first time we can pass in

00:02:11.877 --> 00:02:14.917
this flag to say create customer on signup as

00:02:14.917 --> 00:02:15.357
true.

00:02:15.357 --> 00:02:17.757
So the second a user like gives us their email and

00:02:17.757 --> 00:02:18.797
they sign up for the account,

00:02:18.797 --> 00:02:20.677
it'll go ahead and create a Stripe customer for

00:02:20.677 --> 00:02:20.887
that

00:02:20.887 --> 00:02:22.257
user even if they haven't paid.

00:02:22.257 --> 00:02:24.137
They'll just be a record in stripes database of

00:02:24.137 --> 00:02:25.877
like some somebody that potentially is going to be

00:02:25.877 --> 00:02:26.647
checking out soon.

00:02:26.647 --> 00:02:29.417
and then the second thing that is really nice

00:02:29.417 --> 00:02:30.337
about it is it has

00:02:30.557 --> 00:02:34.157
a backend implementation of managing subscriptions

00:02:34.477 --> 00:02:37.077
and then also it has front end hooks to interface

00:02:37.077 --> 00:02:37.877
with those subscriptions.

00:02:37.877 --> 00:02:38.957
So we'll get deeper into that.

00:02:39.087 --> 00:02:41.447
and then like the really like the last thing that

00:02:41.447 --> 00:02:43.567
I feel like is like super useful is

00:02:43.917 --> 00:02:44.317
they

00:02:44.637 --> 00:02:47.317
manage most of the web hook logic for us which is

00:02:47.317 --> 00:02:47.997
a huge win.

00:02:48.057 --> 00:02:49.777
because implementing like the web hook stuff can

00:02:49.777 --> 00:02:50.457
also be tedious.

00:02:50.457 --> 00:02:52.137
You need to know which webhooks to listen to.

00:02:52.137 --> 00:02:53.727
You need to know what that data looks like from

00:02:53.877 --> 00:02:55.237
Stripe and they need to figure out like okay,

00:02:55.237 --> 00:02:56.397
I get this event from Stripe,

00:02:56.397 --> 00:02:57.077
what do I do?

00:02:57.277 --> 00:02:59.757
business logic wise against my database.

00:02:59.757 --> 00:03:01.217
so they kind of take care of a lot of this like

00:03:01.217 --> 00:03:03.017
generic stuff for us which is really cool.

00:03:03.097 --> 00:03:03.497
So

00:03:03.817 --> 00:03:05.617
just some basic implementation here.

00:03:05.617 --> 00:03:06.777
Essentially you have

00:03:07.627 --> 00:03:08.906
this is the server side

00:03:09.087 --> 00:03:09.787
configuration.

00:03:09.867 --> 00:03:13.427
So we're going to be passing in this Stripe object

00:03:13.427 --> 00:03:14.107
and then

00:03:14.327 --> 00:03:17.327
generating a new like generating some additional

00:03:17.327 --> 00:03:18.367
schemas for it.

00:03:19.047 --> 00:03:21.847
then on the client side essentially we're going to

00:03:21.847 --> 00:03:23.787
be passing in this plugin on the client side as

00:03:23.787 --> 00:03:23.947
well.

00:03:23.947 --> 00:03:26.307
So inside of our React app and then we're going to

00:03:26.307 --> 00:03:27.747
say like subscriptions are true.

00:03:27.747 --> 00:03:29.307
And what that's going to do is it's going to give

00:03:29.307 --> 00:03:30.387
us these different hooks.

00:03:30.667 --> 00:03:31.796
see if they have an example of it

00:03:31.796 --> 00:03:32.852
on the client side.

00:03:32.898 --> 00:03:33.195
Yeah,

00:03:33.195 --> 00:03:34.795
they'll basically give us these hooks where we can

00:03:34.795 --> 00:03:35.315
call like

00:03:35.735 --> 00:03:37.095
upgrade or subscribe.

00:03:37.095 --> 00:03:38.655
And essentially what that's going to do is it's

00:03:38.655 --> 00:03:40.415
going to go through the process of like having the

00:03:40.415 --> 00:03:41.855
user onboard onto our product,

00:03:41.855 --> 00:03:43.575
put their credit card on file and actually charge

00:03:43.575 --> 00:03:43.895
them.

00:03:43.895 --> 00:03:44.295
So

00:03:44.515 --> 00:03:46.015
there's kind of a lot to go through here but we're

00:03:46.015 --> 00:03:47.535
just going to kind of take it piece by piece.

00:03:47.535 --> 00:03:49.255
So first thing that we're going to want to do is

00:03:49.255 --> 00:03:51.375
we're going to want to head over to our

00:03:52.375 --> 00:03:54.895
Data Ops package and this section is going to be

00:03:54.895 --> 00:03:57.255
exclusively inside of our Data Ops package.

00:03:57.255 --> 00:03:59.175
So I'm going to go ahead and say

00:03:59.815 --> 00:04:00.695
CD into

00:04:01.015 --> 00:04:01.655
packages

00:04:02.775 --> 00:04:03.735
Data Ops.

00:04:03.895 --> 00:04:05.495
And I'm just going to open this

00:04:07.015 --> 00:04:08.375
in a new,

00:04:08.605 --> 00:04:09.405
tab here.

00:04:09.485 --> 00:04:09.885
So

00:04:10.244 --> 00:04:11.964
now the first thing that we're going to do is

00:04:11.964 --> 00:04:13.964
we're going to come to source and then come to our

00:04:13.964 --> 00:04:14.324
auth

00:04:14.644 --> 00:04:17.324
file and we're going to be adding our Stripe

00:04:17.324 --> 00:04:17.804
plugin,

00:04:17.804 --> 00:04:20.304
which we can kind of look at example of it here.

00:04:22.268 --> 00:04:25.388
So you can see that they want us to install Stripe

00:04:25.388 --> 00:04:27.948
and they also want us to install the Better Auth

00:04:27.948 --> 00:04:28.908
Stripe plugin.

00:04:28.908 --> 00:04:32.148
Now what I did find is the versions really matter

00:04:32.148 --> 00:04:33.388
when working with plugins,

00:04:33.388 --> 00:04:35.388
so you need to make sure that you keep the same

00:04:35.388 --> 00:04:36.588
version of the,

00:04:36.618 --> 00:04:37.128
of the

00:04:37.448 --> 00:04:38.168
Stripe,

00:04:38.478 --> 00:04:40.378
like plugin for like the Better auth,

00:04:40.778 --> 00:04:43.018
the same version as like your actual Better auth.

00:04:43.652 --> 00:04:44.412
your better auth,

00:04:44.412 --> 00:04:45.492
like dependency.

00:04:45.492 --> 00:04:46.892
So I'll just show you what that means.

00:04:46.892 --> 00:04:48.052
It's probably a little bit confusing.

00:04:48.052 --> 00:04:49.892
So if we head over to our package JSON,

00:04:50.052 --> 00:04:51.572
what you're going to see here is we have better

00:04:51.572 --> 00:04:52.692
auth as a dependency

00:04:53.012 --> 00:04:53.412
and

00:04:53.971 --> 00:04:54.612
we could also,

00:04:54.612 --> 00:04:54.972
you know,

00:04:54.972 --> 00:04:55.812
run this command,

00:04:55.952 --> 00:04:57.312
to add pmpm,

00:04:57.312 --> 00:04:58.272
add Stripe.

00:04:58.272 --> 00:04:59.272
Better auth Stripe.

00:04:59.272 --> 00:05:01.272
Now I'm just going to go ahead and hard code these

00:05:01.272 --> 00:05:02.112
in just because,

00:05:02.352 --> 00:05:04.172
I did find that this is a little bit tedious.

00:05:04.172 --> 00:05:06.412
So we can go ahead and delete Better auth here

00:05:06.902 --> 00:05:08.262
and then I'm just going to,

00:05:08.672 --> 00:05:09.342
paste these in.

00:05:09.342 --> 00:05:11.382
So basically we have better auth and then now

00:05:11.382 --> 00:05:12.062
we're going to be using

00:05:12.542 --> 00:05:14.434
version 1.3.4.

00:05:14.476 --> 00:05:15.676
And additionally

00:05:15.996 --> 00:05:18.716
we now have this Better Auth plugin for Stripe,

00:05:18.716 --> 00:05:19.876
and that's going to be the same version.

00:05:19.876 --> 00:05:21.556
And notice I don't have this little character here

00:05:21.556 --> 00:05:23.036
because we're pinning these versions.

00:05:23.036 --> 00:05:24.076
We don't want these to change.

00:05:24.166 --> 00:05:25.214
Now while we're at it,

00:05:25.214 --> 00:05:27.374
I'm just going to go ahead and add Stripe here

00:05:27.374 --> 00:05:27.654
too.

00:05:27.894 --> 00:05:28.294
So,

00:05:29.334 --> 00:05:31.814
what we can do is we can say PMPMI and we should

00:05:31.814 --> 00:05:32.934
install these new versions.

00:05:33.428 --> 00:05:33.868
All right?

00:05:33.868 --> 00:05:36.348
So now what we can do is we can go ahead and

00:05:36.348 --> 00:05:37.588
import two different things.

00:05:37.588 --> 00:05:38.948
We'll import the Stripe plugin,

00:05:38.948 --> 00:05:40.028
I'll delete organizations,

00:05:40.028 --> 00:05:41.348
because we don't care about it anymore.

00:05:42.128 --> 00:05:43.728
the Stripe plugin from Better Auth.

00:05:43.728 --> 00:05:44.928
And then we're also going to,

00:05:45.508 --> 00:05:48.508
import the Stripe client from Stripes SDK.

00:05:48.508 --> 00:05:50.548
So we install both of these dependencies just now.

00:05:51.132 --> 00:05:52.732
After that we're going to go ahead and

00:05:53.452 --> 00:05:55.692
create a Stripe client here.

00:05:55.692 --> 00:05:57.852
And essentially what this is going to do is this

00:05:57.852 --> 00:05:58.572
is going to

00:05:59.172 --> 00:06:00.832
give us the ability to

00:06:02.461 --> 00:06:04.861
actually like build out the plugin system.

00:06:05.021 --> 00:06:05.421
So

00:06:05.441 --> 00:06:08.281
we're going to eventually have to pass in a key at

00:06:08.281 --> 00:06:08.801
this level,

00:06:09.381 --> 00:06:10.181
a Stripe API key,

00:06:10.181 --> 00:06:11.661
but we'll get to that in just a second.

00:06:11.713 --> 00:06:14.233
Now to use this Stripe plugin we're actually going

00:06:14.233 --> 00:06:15.853
to have to pass a few different like

00:06:15.853 --> 00:06:17.913
environment variables and secrets and whatnot

00:06:18.223 --> 00:06:18.703
into it.

00:06:18.703 --> 00:06:20.663
So in order to make this a little bit more

00:06:20.663 --> 00:06:23.343
extensible for like generating schemas but also

00:06:23.343 --> 00:06:24.623
integrating into our application,

00:06:24.863 --> 00:06:26.783
I'm going to go ahead and define this type which

00:06:26.783 --> 00:06:27.663
takes in a,

00:06:28.183 --> 00:06:30.393
Stripe web host secret and then also takes in

00:06:30.433 --> 00:06:32.083
plans array and you'll see what that means

00:06:32.253 --> 00:06:33.133
in just a minute.

00:06:34.253 --> 00:06:36.973
So from there what we're going to do is we're

00:06:36.973 --> 00:06:39.053
going to take this helper function and then I'm

00:06:39.053 --> 00:06:41.453
just going to say we're also going to be passing

00:06:41.453 --> 00:06:42.173
in an optional

00:06:42.493 --> 00:06:44.013
stripe configuration here.

00:06:45.473 --> 00:06:45.713
And

00:06:46.433 --> 00:06:48.673
what we can say is we pass in that stripe

00:06:48.673 --> 00:06:49.393
configuration

00:06:49.853 --> 00:06:50.416
and then

00:06:50.736 --> 00:06:52.816
under our actual better auth

00:06:52.866 --> 00:06:53.896
configuration here,

00:06:54.136 --> 00:06:55.976
we're going to go ahead and say plugins

00:06:57.416 --> 00:06:59.616
and that's going to take an array of plugins and

00:06:59.616 --> 00:07:01.376
we're going to be using the Stripe plugin,

00:07:01.376 --> 00:07:02.856
which is imported right here.

00:07:02.878 --> 00:07:04.481
And the stripe plugin is going to take some

00:07:04.481 --> 00:07:04.801
information.

00:07:05.121 --> 00:07:07.001
So first thing that we're going to do is we're

00:07:07.001 --> 00:07:08.161
going to provide it the

00:07:08.651 --> 00:07:10.491
Stripe client which we defined,

00:07:10.667 --> 00:07:11.307
right here.

00:07:11.330 --> 00:07:14.036
We are also going to be passing in the

00:07:14.826 --> 00:07:18.746
a Stripe webhook secret which can be pulled from a

00:07:18.746 --> 00:07:19.706
process emv,

00:07:19.706 --> 00:07:21.786
which will probably be adding it into a emv file

00:07:21.786 --> 00:07:22.426
in just a second.

00:07:22.746 --> 00:07:25.706
And then also it could take it from the top level

00:07:25.706 --> 00:07:26.266
property.

00:07:26.346 --> 00:07:28.506
So during runtime we could pass that in as well.

00:07:28.956 --> 00:07:31.046
I'm going to go ahead and have this configuration

00:07:31.786 --> 00:07:32.026
for

00:07:32.506 --> 00:07:33.946
Create Customer at signup.

00:07:33.946 --> 00:07:35.626
So essentially what this configuration is going to

00:07:35.626 --> 00:07:38.106
do is it's going to create the customer in stripe

00:07:38.106 --> 00:07:40.826
whenever a user signs up for the first time.

00:07:40.826 --> 00:07:43.066
And then also this is going to be what powers the

00:07:43.396 --> 00:07:44.406
new schema,

00:07:44.586 --> 00:07:46.705
for our users table and you'll see that in just a

00:07:46.705 --> 00:07:46.986
second.

00:07:47.706 --> 00:07:48.106
And

00:07:48.826 --> 00:07:51.866
also I'm going to pass in the subscriptions,

00:07:52.196 --> 00:07:53.526
the subscription property here,

00:07:53.766 --> 00:07:55.966
which basically says subscriptions are going to be

00:07:55.966 --> 00:07:57.926
enabled and it's going to be taking

00:07:58.216 --> 00:07:59.786
an array of plans and we'll get into that just a

00:07:59.786 --> 00:07:59.986
bit.

00:07:59.986 --> 00:08:00.746
So for now though,

00:08:00.746 --> 00:08:01.776
just for the purpose of this,

00:08:01.846 --> 00:08:02.806
I want to comment this out

00:08:03.758 --> 00:08:04.256
and then

00:08:04.576 --> 00:08:07.136
I suspect what we're also going to want to do here

00:08:07.136 --> 00:08:08.976
is at this get off level

00:08:09.456 --> 00:08:11.936
we will also be passing in a

00:08:12.696 --> 00:08:14.175
also be passing in stripe.

00:08:14.175 --> 00:08:15.816
So I'm going to knock this down one level

00:08:15.884 --> 00:08:16.483
comma

00:08:16.483 --> 00:08:18.602
and then this is also going to take a stripe

00:08:18.602 --> 00:08:21.722
config and we're going to be passing it into our

00:08:22.652 --> 00:08:23.978
create better auth client here.

00:08:24.270 --> 00:08:26.150
Now the next thing that we're going to do is we

00:08:26.150 --> 00:08:29.630
are going to head over to dashboard.swepe.com if

00:08:29.630 --> 00:08:30.670
you don't have a stripe account,

00:08:30.670 --> 00:08:31.670
you can go ahead and create one.

00:08:31.670 --> 00:08:32.030
It's very,

00:08:32.030 --> 00:08:32.670
very easy.

00:08:32.990 --> 00:08:35.950
Then on this left side you are going to see kind

00:08:35.950 --> 00:08:37.750
of like a drop down and you'll see a section that

00:08:37.750 --> 00:08:38.670
says sandbox.

00:08:39.000 --> 00:08:41.480
you can go ahead to sandbox and then there will be

00:08:41.480 --> 00:08:43.480
the option to like create a sandbox.

00:08:43.480 --> 00:08:44.800
So we're going to go ahead and just go through

00:08:44.800 --> 00:08:46.300
this process of creat a new sandbox.

00:08:46.300 --> 00:08:47.060
I'm going to say

00:08:47.860 --> 00:08:48.420
smart

00:08:48.900 --> 00:08:49.380
link

00:08:50.717 --> 00:08:51.117
and

00:08:51.377 --> 00:08:51.637
you could,

00:08:51.637 --> 00:08:53.997
if you have an existing account you could copy a

00:08:53.997 --> 00:08:56.197
bunch of like products and configurations over.

00:08:56.197 --> 00:08:57.957
But we're just going to start from scratch and

00:08:57.957 --> 00:08:58.972
basically say create account.

00:08:58.972 --> 00:08:59.492
All right,

00:08:59.492 --> 00:09:02.892
now from here what we can do is we can come over

00:09:02.892 --> 00:09:04.852
and we're going to grab our secret key

00:09:05.252 --> 00:09:06.212
and copy that.

00:09:06.292 --> 00:09:08.292
Now I have this

00:09:08.982 --> 00:09:11.262
this little helper function here or this like

00:09:11.262 --> 00:09:14.342
Stripe client which is being passed into our

00:09:14.342 --> 00:09:15.142
better auth

00:09:15.532 --> 00:09:16.322
configuration.

00:09:16.882 --> 00:09:19.522
And this is actually going to need a valid

00:09:19.792 --> 00:09:21.802
test key in order to generate the schemas.

00:09:21.802 --> 00:09:22.922
I honestly don't know why they do this.

00:09:22.922 --> 00:09:25.522
I feel like we shouldn't have to pass this in for

00:09:25.522 --> 00:09:26.562
schema generation.

00:09:26.642 --> 00:09:29.122
But they do want a valid key unfortunately.

00:09:29.202 --> 00:09:29.602
So

00:09:29.692 --> 00:09:32.242
we could add this into our process env.

00:09:32.242 --> 00:09:32.962
We'll just say

00:09:34.412 --> 00:09:34.892
stripe

00:09:35.692 --> 00:09:36.092
key

00:09:37.998 --> 00:09:39.444
and then we can say

00:09:43.314 --> 00:09:44.004
stripe key.

00:09:44.556 --> 00:09:46.632
And because this is only going to be used once,

00:09:46.632 --> 00:09:48.632
I'll just go ahead and force that type here.

00:09:48.872 --> 00:09:49.272
So.

00:09:49.512 --> 00:09:50.072
Okay,

00:09:50.712 --> 00:09:52.872
now this is where we're going to really want to

00:09:52.872 --> 00:09:53.512
pay close attention.

00:09:53.672 --> 00:09:54.632
So currently

00:09:55.372 --> 00:09:57.078
we have our auth schema

00:09:57.078 --> 00:09:59.541
and we have a users table.

00:09:59.541 --> 00:10:01.661
Now users table doesn't have any information about

00:10:01.661 --> 00:10:03.461
Stripe with this plugin.

00:10:03.461 --> 00:10:05.261
Essentially what's going to happen is we're going

00:10:05.261 --> 00:10:07.941
to be able to generate a new schema for

00:10:08.171 --> 00:10:11.241
users that actually has a Stripe customer id.

00:10:11.401 --> 00:10:12.521
So if you remember,

00:10:12.521 --> 00:10:13.961
we have our better auth

00:10:14.211 --> 00:10:16.891
command which is basically saying go ahead and

00:10:16.891 --> 00:10:18.371
look at our better auth

00:10:18.601 --> 00:10:19.501
auth gen file

00:10:20.211 --> 00:10:20.451
and

00:10:20.931 --> 00:10:23.531
put the output into this auth schema.

00:10:23.531 --> 00:10:25.411
So we can say pmpm run

00:10:27.628 --> 00:10:28.602
better auth generate

00:10:28.602 --> 00:10:30.592
it's basically going to tell us that,

00:10:30.792 --> 00:10:33.152
this is going to make some changes to this file

00:10:33.152 --> 00:10:34.072
which already exists.

00:10:34.072 --> 00:10:35.232
Do you want to overwrite them?

00:10:35.232 --> 00:10:36.472
We're going to go ahead and say yes.

00:10:36.678 --> 00:10:37.638
Now that that command,

00:10:37.738 --> 00:10:38.818
ran successfully,

00:10:39.218 --> 00:10:41.298
we can head over to our

00:10:41.778 --> 00:10:42.838
auth schema

00:10:42.838 --> 00:10:44.972
and what we're going to notice is this user table

00:10:45.372 --> 00:10:46.812
now has a stripe id.

00:10:47.292 --> 00:10:49.412
So essentially there's been a schema modification

00:10:49.412 --> 00:10:50.332
and this is where like,

00:10:50.332 --> 00:10:52.212
working with Drizzle just kind of gives us an

00:10:52.212 --> 00:10:53.092
extra step of.

00:10:53.092 --> 00:10:54.172
Now we have a,

00:10:54.232 --> 00:10:56.052
we have like a change in our table.

00:10:56.212 --> 00:10:57.812
So we're going to have to go ahead and create this

00:10:57.812 --> 00:10:58.252
column.

00:10:58.252 --> 00:10:59.002
Now we could just

00:10:59.392 --> 00:11:02.232
run a command inside of our D1 studio to create

00:11:02.232 --> 00:11:02.752
that column.

00:11:02.752 --> 00:11:05.112
But what we could also do is we have these helpful

00:11:05.112 --> 00:11:07.792
little commands inside of here where we can say

00:11:09.072 --> 00:11:09.412
pnpm

00:11:10.032 --> 00:11:10.432
run

00:11:10.752 --> 00:11:11.312
generate.

00:11:11.312 --> 00:11:13.992
And that's going to look at our auth schema and it

00:11:13.992 --> 00:11:15.312
should detect if there's a change.

00:11:15.392 --> 00:11:17.912
So notice we just got in our Drizzle out,

00:11:17.912 --> 00:11:20.552
we just got a new SQL file and that just basically

00:11:20.552 --> 00:11:22.512
spit out this command for us here.

00:11:23.152 --> 00:11:25.512
So we could head over to our Drizzle studio and

00:11:25.512 --> 00:11:27.072
this is our stage database.

00:11:27.462 --> 00:11:29.222
I'm going to paste this guy in there and run it.

00:11:29.542 --> 00:11:30.902
So now we've created that,

00:11:30.992 --> 00:11:32.105
we've created the user table

00:11:32.555 --> 00:11:33.195
and then,

00:11:33.465 --> 00:11:34.678
so we have alter user

00:11:34.678 --> 00:11:36.950
and then I'm also going to go do the same thing

00:11:36.950 --> 00:11:37.310
for

00:11:37.790 --> 00:11:38.190
our

00:11:38.510 --> 00:11:40.186
production database really quickly.

00:11:40.780 --> 00:11:41.299
All right,

00:11:41.379 --> 00:11:43.619
so now I just kind of want to like,

00:11:43.619 --> 00:11:45.609
stop for just a second and kind of recap.

00:11:45.699 --> 00:11:47.139
we have this configuration

00:11:47.599 --> 00:11:48.719
inside of our source

00:11:48.725 --> 00:11:49.411
called Auth

00:11:49.891 --> 00:11:51.371
and we added a plugin,

00:11:51.371 --> 00:11:53.251
and in this plugin we added some configurations

00:11:53.251 --> 00:11:54.051
that are required.

00:11:54.051 --> 00:11:56.371
And then we ran our generate command for better

00:11:56.371 --> 00:11:56.691
auth

00:11:57.011 --> 00:11:59.451
that gave us an update to our schema and then we

00:11:59.451 --> 00:12:01.091
used our schema to generate an update,

00:12:01.171 --> 00:12:04.331
like an actual like query to update the schema

00:12:04.331 --> 00:12:05.451
inside of our database.

00:12:05.451 --> 00:12:05.811
Now,

00:12:06.091 --> 00:12:07.531
the really important thing to understand about

00:12:07.531 --> 00:12:09.811
Better off are these plugins kind of dictate that

00:12:09.811 --> 00:12:12.251
schema and how the tables relate to each other.

00:12:12.251 --> 00:12:12.611
So,

00:12:12.921 --> 00:12:14.481
what you're going to notice is when we come over

00:12:14.481 --> 00:12:15.961
here and we say subscription,

00:12:17.431 --> 00:12:19.401
we're basically going to say subscription enabled

00:12:19.401 --> 00:12:19.961
to true.

00:12:20.441 --> 00:12:23.081
If we go ahead and we run our

00:12:23.431 --> 00:12:24.721
better auth generate command,

00:12:24.824 --> 00:12:26.303
it's going to go through this process again and

00:12:26.303 --> 00:12:27.624
it's probably going to prompt us if we want to

00:12:27.624 --> 00:12:28.304
override it.

00:12:28.544 --> 00:12:30.624
Then if we head back over to our

00:12:31.072 --> 00:12:32.836
auth ts in the drizzle output,

00:12:32.836 --> 00:12:34.705
what you're going to notice is we now have this

00:12:34.705 --> 00:12:35.635
subscription table.

00:12:36.505 --> 00:12:37.465
So if we run

00:12:37.895 --> 00:12:40.255
the PNPM run generate which is going to trigger

00:12:40.255 --> 00:12:41.655
the drizzle generation,

00:12:41.815 --> 00:12:44.335
we're going to get this new SQL file which

00:12:44.335 --> 00:12:45.495
basically says Create

00:12:46.475 --> 00:12:46.875
table.

00:12:46.955 --> 00:12:47.355
Now

00:12:47.835 --> 00:12:50.475
one thing that I do want to note after creating

00:12:50.475 --> 00:12:51.394
this to these tables,

00:12:51.394 --> 00:12:52.835
so we'll go ahead and create this table in

00:12:52.835 --> 00:12:53.355
production

00:12:54.315 --> 00:12:56.715
and I'm going to go ahead and create it in our

00:12:56.935 --> 00:12:57.690
stage database.

00:12:58.205 --> 00:13:00.005
Now a really important thing to note is like if

00:13:00.005 --> 00:13:02.765
you're not keeping these files in your project or

00:13:02.765 --> 00:13:04.175
they're outdated or whatnot,

00:13:04.305 --> 00:13:06.865
you could just go ahead and like delete meta

00:13:07.185 --> 00:13:07.585
here

00:13:07.590 --> 00:13:10.570
and then you could delete these files as well.

00:13:13.577 --> 00:13:15.737
Then when you run this generate command

00:13:16.057 --> 00:13:18.217
it's going to give you a SQL statement

00:13:18.947 --> 00:13:19.187
with

00:13:19.337 --> 00:13:20.847
the create statement with the Create

00:13:21.457 --> 00:13:23.457
statements for all of these tables.

00:13:23.457 --> 00:13:26.217
Now where this could be tedious is essentially for

00:13:26.217 --> 00:13:26.697
like user.

00:13:26.697 --> 00:13:28.577
For example you got the alter

00:13:29.097 --> 00:13:31.657
the alter command to basically like create this

00:13:31.657 --> 00:13:32.217
column.

00:13:32.377 --> 00:13:34.857
But if you don't keep this meta

00:13:34.947 --> 00:13:36.857
file up to date or you delete it or whatnot,

00:13:37.097 --> 00:13:39.337
essentially this is what this is keeping track of

00:13:39.337 --> 00:13:41.937
like table creations or changes and whatnot.

00:13:41.937 --> 00:13:43.417
So and then it generates those

00:13:43.527 --> 00:13:44.567
SQL commands for us.

00:13:44.567 --> 00:13:45.687
So if you don't have it,

00:13:45.687 --> 00:13:47.687
just note you probably already have this table

00:13:47.687 --> 00:13:48.167
created.

00:13:48.167 --> 00:13:49.987
You're going to have to just manually run the

00:13:49.987 --> 00:13:50.387
alter

00:13:50.637 --> 00:13:53.627
table command to create this column and then head

00:13:53.627 --> 00:13:54.347
over to

00:13:55.067 --> 00:13:55.839
subscription

00:13:55.839 --> 00:13:57.938
and do a similar thing here where you just create

00:13:57.938 --> 00:13:58.978
that subscription table.

00:13:58.978 --> 00:14:00.058
So by this point

00:14:00.228 --> 00:14:02.838
you should have subscription and the user table

00:14:02.838 --> 00:14:05.878
altered in both the production database and the

00:14:05.878 --> 00:14:06.918
stage database.

00:14:06.998 --> 00:14:07.398
Now

00:14:09.158 --> 00:14:11.558
the last thing that I'm going to want to do is I'm

00:14:11.558 --> 00:14:13.878
going to want to say pnpm run build

00:14:14.242 --> 00:14:16.922
and that is going to push these changes over for

00:14:16.922 --> 00:14:17.282
us

00:14:17.682 --> 00:14:20.442
or push these changes into this disk folder and

00:14:20.442 --> 00:14:23.512
then this is now going to be usable from by our

00:14:23.792 --> 00:14:26.112
like our actual like user application.

00:14:26.272 --> 00:14:26.672
So

00:14:27.041 --> 00:14:28.882
I hope you're able to follow up at this point

00:14:28.882 --> 00:14:31.282
essentially we're just kind of like configuring

00:14:31.772 --> 00:14:33.022
We're configuring our

00:14:33.268 --> 00:14:36.002
better auth server side client to take in some

00:14:36.002 --> 00:14:36.962
information about

00:14:37.902 --> 00:14:40.222
like Stripe webhook Secrets,

00:14:40.222 --> 00:14:41.916
Stripe API Secrets and whatnot.

00:14:42.172 --> 00:14:43.532
So we are actually able to

00:14:43.852 --> 00:14:44.652
generate the

00:14:44.832 --> 00:14:47.632
schema changes needed to power Stripe billing

00:14:47.952 --> 00:14:49.192
in our user application.

00:14:49.192 --> 00:14:51.552
Now one thing that I am noticing here is

00:14:52.112 --> 00:14:54.032
we may want to actually move

00:14:54.382 --> 00:14:55.512
we may want to move

00:14:55.832 --> 00:14:58.312
the stripe as an optional

00:14:59.269 --> 00:15:02.109
essentially as an optional property just so we can

00:15:02.109 --> 00:15:04.989
pass in the instantiated version during runtime.

00:15:04.989 --> 00:15:06.589
And I'll show you what that means in just a second

00:15:06.589 --> 00:15:06.949
here.

00:15:06.949 --> 00:15:09.109
So we're just going to make sure we have Stripe

00:15:09.109 --> 00:15:10.789
client being passed in

00:15:11.593 --> 00:15:12.551
if needed.

00:15:12.551 --> 00:15:14.871
So basically Stripe client is going to be

00:15:15.332 --> 00:15:16.938
config.speed

00:15:16.938 --> 00:15:18.429
config.

00:15:18.589 --> 00:15:20.029
Stripe client

00:15:20.834 --> 00:15:22.354
or Stripe Client if it

00:15:22.354 --> 00:15:23.574
if it isn't passed in.

00:15:23.574 --> 00:15:26.174
So then at this level whenever we actually use

00:15:26.174 --> 00:15:26.814
better auth,

00:15:27.134 --> 00:15:28.534
we can pass in that Stripe client.

00:15:28.534 --> 00:15:31.053
So we can actually pass it the production API key

00:15:31.053 --> 00:15:34.254
because this API key is just hard coded into our

00:15:34.254 --> 00:15:34.694
code,

00:15:34.694 --> 00:15:35.374
into our

00:15:35.374 --> 00:15:36.164
actual like

00:15:37.024 --> 00:15:37.384
build.

00:15:37.425 --> 00:15:37.692
All right,

00:15:37.692 --> 00:15:39.292
so in this next video we're going to

00:15:39.802 --> 00:15:41.842
actually before that make sure you build one last

00:15:41.842 --> 00:15:42.122
time.

00:15:42.122 --> 00:15:44.122
I don't want to leave you behind there.

00:15:44.122 --> 00:15:44.522
So

00:15:45.002 --> 00:15:46.442
pmpm run build

00:15:49.242 --> 00:15:51.562
and then we're going to be moving into the user

00:15:51.562 --> 00:15:51.962
application.

00:15:51.962 --> 00:15:53.962
We're actually going to be fully integrating the

00:15:54.542 --> 00:15:57.402
payments into our UI and our server side stuff.

