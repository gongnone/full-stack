WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.060 --> 00:00:00.340
All right,

00:00:00.340 --> 00:00:01.660
so let's talk about authentication.

00:00:01.820 --> 00:00:02.140
Now.

00:00:02.140 --> 00:00:04.180
Before we roll out authentication into our

00:00:04.180 --> 00:00:04.700
application,

00:00:04.700 --> 00:00:07.020
I do think that we should understand a few of

00:00:07.020 --> 00:00:09.740
these concepts just so we can like make sure we're

00:00:09.740 --> 00:00:10.820
all talking about the same things.

00:00:10.820 --> 00:00:13.100
And if you're really new to

00:00:13.370 --> 00:00:15.290
like the authentication space and building this

00:00:15.290 --> 00:00:15.890
kind of stuff out,

00:00:15.890 --> 00:00:16.850
I think this will be useful.

00:00:16.850 --> 00:00:17.290
So like,

00:00:17.450 --> 00:00:19.090
there's a few different components that you're

00:00:19.090 --> 00:00:19.690
going to notice.

00:00:19.940 --> 00:00:22.220
but all of these components working together is

00:00:22.220 --> 00:00:23.900
kind of like what builds out your authentication

00:00:23.900 --> 00:00:24.260
system.

00:00:24.340 --> 00:00:24.740
Now,

00:00:25.220 --> 00:00:27.220
one of like if you're kind of more on the front

00:00:27.220 --> 00:00:27.940
end side of things,

00:00:27.940 --> 00:00:29.860
you are probably used to like authentication

00:00:29.860 --> 00:00:30.260
hooks.

00:00:30.260 --> 00:00:30.860
So these are,

00:00:30.860 --> 00:00:32.700
these are basically like in React,

00:00:32.700 --> 00:00:34.150
they're just like stateful hooks,

00:00:34.150 --> 00:00:34.960
and other frameworks.

00:00:34.960 --> 00:00:37.600
They're basically just like reusable front end

00:00:37.600 --> 00:00:41.320
code that allows you to see like information about

00:00:41.320 --> 00:00:41.800
a user.

00:00:41.800 --> 00:00:43.080
You can know their user id,

00:00:43.160 --> 00:00:44.920
you can see if they're signed in or not.

00:00:45.360 --> 00:00:47.680
on like the web page itself.

00:00:47.680 --> 00:00:48.920
And then on the webpage,

00:00:48.920 --> 00:00:49.840
if you're doing like

00:00:50.280 --> 00:00:51.240
client side routing,

00:00:51.560 --> 00:00:53.240
navigating pages via the client,

00:00:53.240 --> 00:00:54.600
you can basically check like,

00:00:54.600 --> 00:00:56.360
is this user allowed to see this page?

00:00:56.360 --> 00:00:56.720
If not,

00:00:56.720 --> 00:00:56.920
like,

00:00:56.920 --> 00:00:57.960
don't show them that page.

00:00:57.960 --> 00:00:58.360
But

00:00:58.680 --> 00:01:01.080
the client side hooks are kind of useless without

00:01:01.240 --> 00:01:03.960
a backend service that is actually authenticating

00:01:03.960 --> 00:01:04.520
that user.

00:01:04.520 --> 00:01:06.600
And that's kind of where this layer comes in.

00:01:06.680 --> 00:01:07.080
Now

00:01:08.110 --> 00:01:11.230
a basic flow is like a UI is going to

00:01:11.550 --> 00:01:14.430
pass in some information about the client to a

00:01:14.430 --> 00:01:14.910
server

00:01:15.250 --> 00:01:15.490
and

00:01:15.970 --> 00:01:18.501
the server that is handling like authentication

00:01:18.501 --> 00:01:20.767
is going to have its logic of if it's like looking

00:01:20.767 --> 00:01:21.447
at a password,

00:01:21.447 --> 00:01:23.367
it's going to compare the password hash for what a

00:01:23.367 --> 00:01:23.747
user,

00:01:24.247 --> 00:01:25.127
was able to,

00:01:25.607 --> 00:01:27.607
for what the user is able to pass over and then

00:01:27.607 --> 00:01:28.807
like see if that user

00:01:29.127 --> 00:01:30.967
has indeed signed up for the service and it's

00:01:30.967 --> 00:01:31.687
authenticated.

00:01:32.537 --> 00:01:35.017
now username and password is like something that's

00:01:35.017 --> 00:01:35.897
being used less and less.

00:01:35.897 --> 00:01:38.217
And a lot of like things that are being used is,

00:01:38.377 --> 00:01:40.657
are these like sign in with Discord or sign in

00:01:40.657 --> 00:01:42.777
with Google or sign in with GitHub and whatnot.

00:01:42.987 --> 00:01:43.387
and

00:01:43.720 --> 00:01:45.040
this is what we're going to be implementing in

00:01:45.040 --> 00:01:45.800
this side of things.

00:01:45.800 --> 00:01:48.228
But basically what happens is your web app

00:01:48.228 --> 00:01:51.060
opens up like a little redirects to Google and

00:01:51.060 --> 00:01:51.740
then Google

00:01:52.140 --> 00:01:54.820
handles like determining if this user is indeed

00:01:54.820 --> 00:01:57.300
who they say they are and they pass some data back

00:01:57.300 --> 00:01:59.140
over to your service and then your service is

00:01:59.140 --> 00:02:01.140
responsible for taking that data from Google and

00:02:01.140 --> 00:02:01.340
saying,

00:02:01.340 --> 00:02:01.820
okay,

00:02:01.820 --> 00:02:03.860
this is the user Google said that they're

00:02:03.860 --> 00:02:05.940
authenticated so you can go ahead and create that

00:02:05.940 --> 00:02:06.380
user,

00:02:06.740 --> 00:02:09.300
and you can add some records into the database and

00:02:09.300 --> 00:02:10.340
then you can create a session.

00:02:10.510 --> 00:02:12.270
And like essentially a session is something that

00:02:12.430 --> 00:02:15.070
your server passes back to the web app to say,

00:02:15.150 --> 00:02:15.590
okay,

00:02:15.590 --> 00:02:18.110
every single time the user makes a request to me,

00:02:18.350 --> 00:02:19.310
give me this data.

00:02:19.390 --> 00:02:21.070
And then I'm going to use that data,

00:02:21.230 --> 00:02:22.190
that session information

00:02:22.750 --> 00:02:24.790
to ensure the user is who they say they are,

00:02:24.790 --> 00:02:25.630
every single request.

00:02:25.630 --> 00:02:26.870
And there's two ways of doing this.

00:02:26.870 --> 00:02:29.390
There's like session cookies and there's jwt.

00:02:29.550 --> 00:02:31.990
Session cookies just basically means like the

00:02:31.990 --> 00:02:33.710
server generates some ID

00:02:34.350 --> 00:02:36.390
and sticks it into a database and then it has a

00:02:36.390 --> 00:02:37.630
value associated with it.

00:02:37.950 --> 00:02:40.350
And every single time a request is made,

00:02:40.680 --> 00:02:42.096
the server goes to a database,

00:02:42.096 --> 00:02:43.518
looks up if that session exists.

00:02:43.518 --> 00:02:44.518
If the session exists,

00:02:44.598 --> 00:02:44.998
great.

00:02:45.078 --> 00:02:46.598
Passes the data into here,

00:02:46.598 --> 00:02:47.198
says the user,

00:02:47.198 --> 00:02:47.918
is authenticated.

00:02:47.918 --> 00:02:50.198
Then like the logic on the server continues.

00:02:50.338 --> 00:02:51.698
JWT is a little bit different.

00:02:51.698 --> 00:02:52.938
When the user signs in,

00:02:52.938 --> 00:02:56.018
JWT token is created which basically packs in some

00:02:56.018 --> 00:02:59.218
information in this encrypted token that says like

00:02:59.878 --> 00:03:01.478
like probably a user id,

00:03:01.558 --> 00:03:04.318
some very like non personal information about the

00:03:04.318 --> 00:03:06.438
user and then it has like an expiry when that

00:03:06.438 --> 00:03:08.638
token expires and then it sends it back to the

00:03:08.638 --> 00:03:11.218
client and then the client passes that toke over

00:03:11.218 --> 00:03:12.258
every single request.

00:03:12.338 --> 00:03:13.058
And because,

00:03:13.488 --> 00:03:14.498
because it's not session based,

00:03:14.498 --> 00:03:15.618
it's JWT based,

00:03:15.778 --> 00:03:18.258
the server will probably have some like key in

00:03:18.258 --> 00:03:20.978
memory and when it gets a token it'll use the key

00:03:21.138 --> 00:03:23.858
to reconcile the token and the key to make,

00:03:23.858 --> 00:03:26.578
to basically validate that that token is correct.

00:03:26.578 --> 00:03:28.578
Now these are really really big topics.

00:03:28.578 --> 00:03:30.298
I don't want to go like too deep or get too

00:03:30.298 --> 00:03:31.138
distracted with them,

00:03:31.298 --> 00:03:32.578
but just know like a

00:03:32.938 --> 00:03:36.738
a JWT or JSON web token flow basically means once

00:03:36.738 --> 00:03:38.298
the user gets that token,

00:03:38.458 --> 00:03:40.938
the server can validate that the user is who they

00:03:41.958 --> 00:03:43.798
having to go to the database every single time.

00:03:43.798 --> 00:03:45.718
And then a session cookie is a little bit like,

00:03:45.718 --> 00:03:48.278
I think it's kind of a more simple like concept

00:03:48.278 --> 00:03:50.038
where server says hey,

00:03:50.038 --> 00:03:50.758
here's a session,

00:03:50.758 --> 00:03:52.078
sticks that session in the database,

00:03:52.078 --> 00:03:53.158
gives it back to the web app.

00:03:53.478 --> 00:03:54.798
Then web app comes over here,

00:03:54.798 --> 00:03:55.358
says oh,

00:03:55.358 --> 00:03:56.318
let me take a look at the session,

00:03:56.318 --> 00:03:57.318
goes to the database,

00:03:57.398 --> 00:03:58.438
gets the session,

00:03:58.438 --> 00:03:59.398
everything's okay,

00:03:59.558 --> 00:04:01.878
passes the data through to continue handling it.

00:04:01.878 --> 00:04:03.638
Now you notice that I wrote out

00:04:03.708 --> 00:04:04.418
auth middleware.

00:04:04.486 --> 00:04:06.246
So when a user signs up

00:04:06.296 --> 00:04:07.867
or when a user is like logged in

00:04:08.062 --> 00:04:08.302
you,

00:04:08.542 --> 00:04:09.662
it's nice to have

00:04:10.062 --> 00:04:11.418
kind of like generic

00:04:11.496 --> 00:04:14.056
code that is essentially like saying hey,

00:04:14.156 --> 00:04:16.796
every single request if it is going to access data

00:04:16.796 --> 00:04:17.636
that is protected,

00:04:17.636 --> 00:04:19.356
that only logged in users should see.

00:04:19.516 --> 00:04:22.476
I just want to route that request to a middleware

00:04:22.716 --> 00:04:23.116
and

00:04:23.536 --> 00:04:24.956
have the middleware do the authentication,

00:04:24.956 --> 00:04:25.876
make sure everything's okay,

00:04:25.876 --> 00:04:27.036
and then if it is okay,

00:04:27.036 --> 00:04:28.076
pass that information,

00:04:28.636 --> 00:04:31.596
pass the request off to like a route or some type

00:04:31.596 --> 00:04:33.276
of handler that's managing that request.

00:04:33.276 --> 00:04:34.916
And then you can write this code once and you

00:04:34.916 --> 00:04:36.876
could use it for tons and tons of different

00:04:36.876 --> 00:04:37.196
routes.

00:04:37.196 --> 00:04:38.656
That's kind of of like what a middle word is going

00:04:38.656 --> 00:04:38.850
to be.

00:04:38.850 --> 00:04:40.774
Now if we take a step back and we think about

00:04:40.774 --> 00:04:41.014
like,

00:04:41.014 --> 00:04:43.574
how does a user actually sign in or sign up

00:04:43.574 --> 00:04:44.054
basically,

00:04:44.054 --> 00:04:45.334
how do they like log in

00:04:47.094 --> 00:04:47.734
essentially?

00:04:47.734 --> 00:04:48.494
Like what's,

00:04:48.494 --> 00:04:49.214
what you,

00:04:49.214 --> 00:04:50.773
if you were to roll this from scratch,

00:04:50.773 --> 00:04:52.854
you would need to have some type of like route

00:04:53.094 --> 00:04:54.374
that is going to like

00:04:54.965 --> 00:04:55.925
validate

00:04:56.565 --> 00:04:58.125
email and password,

00:04:58.125 --> 00:04:58.485
right?

00:04:58.885 --> 00:05:01.205
And then let's say you roll out Auth,

00:05:01.285 --> 00:05:02.565
like you bring in Google,

00:05:03.075 --> 00:05:04.915
you're going to have to like build out some type

00:05:04.915 --> 00:05:05.475
of route

00:05:05.955 --> 00:05:06.355
that

00:05:06.835 --> 00:05:09.635
gets a request from Google after a user signs in

00:05:11.075 --> 00:05:13.475
and then specifically manages authentication with

00:05:13.475 --> 00:05:14.275
the Google APIs.

00:05:14.275 --> 00:05:15.715
And then if you bring in GitHub,

00:05:15.715 --> 00:05:16.755
you have to do the same.

00:05:17.235 --> 00:05:19.955
And this is the aspect of authentication that I

00:05:19.955 --> 00:05:21.035
feel like is really,

00:05:21.035 --> 00:05:24.475
really messy because each provider is going to do

00:05:24.475 --> 00:05:26.195
things in a slightly different way and you're

00:05:26.195 --> 00:05:27.995
basically just writing a whole bunch of code,

00:05:27.995 --> 00:05:29.955
managing a whole bunch of like secrets and tokens

00:05:29.955 --> 00:05:31.435
and whatnot with each provider.

00:05:31.435 --> 00:05:31.795
And

00:05:32.585 --> 00:05:34.565
it can get to the point where it's like,

00:05:34.565 --> 00:05:34.885
oh man,

00:05:34.885 --> 00:05:36.925
this is such a pain to like to manage.

00:05:36.925 --> 00:05:38.565
And then once the user signed in,

00:05:38.565 --> 00:05:39.605
you basically have to like

00:05:39.925 --> 00:05:43.445
create a specific user ID that's specific for your

00:05:43.445 --> 00:05:45.405
system and then save that information into a

00:05:45.405 --> 00:05:45.925
database.

00:05:45.925 --> 00:05:46.805
Now the

00:05:47.015 --> 00:05:48.395
framework that we're going to be using for

00:05:48.395 --> 00:05:50.434
managing Auth is called Better Auth.

00:05:50.434 --> 00:05:52.875
And the reason why I like Better Auth is it's not

00:05:52.875 --> 00:05:53.595
a managed service.

00:05:53.595 --> 00:05:55.195
It's a service that you kind of like bring into

00:05:55.195 --> 00:05:57.355
your application and you implement it the way that

00:05:57.355 --> 00:05:58.755
you want to roll out your auth.

00:05:58.915 --> 00:05:59.315
So

00:05:59.565 --> 00:06:01.365
you can choose which providers you want to use

00:06:01.845 --> 00:06:03.565
and you just basically pass in.

00:06:03.565 --> 00:06:05.605
You basically give it like one Auth

00:06:05.925 --> 00:06:08.565
endpoint and that auth endpoint is going to

00:06:08.565 --> 00:06:11.045
dynamically be able to handle every single

00:06:11.045 --> 00:06:12.205
provider that you bring on.

00:06:12.205 --> 00:06:14.325
You're not ever going to actually have to like

00:06:14.885 --> 00:06:17.125
roll out a specific Google one and a specific

00:06:17.125 --> 00:06:17.805
GitHub one.

00:06:17.805 --> 00:06:19.525
Like it's going to take care of all of the server

00:06:19.525 --> 00:06:20.485
side stuff for you,

00:06:20.485 --> 00:06:21.205
which is really,

00:06:21.205 --> 00:06:21.765
really great.

00:06:22.366 --> 00:06:24.166
Now the other thing that it brings to the table

00:06:24.166 --> 00:06:26.206
like we mentioned before is it also has a whole

00:06:26.206 --> 00:06:27.486
bunch of like client side

00:06:27.786 --> 00:06:28.316
hooks

00:06:28.716 --> 00:06:31.116
that you can use with like React and Svelte and

00:06:31.116 --> 00:06:33.036
Nuxt and different frameworks that you're using.

00:06:33.036 --> 00:06:33.436
So

00:06:33.956 --> 00:06:36.196
you can essentially like import the Better auth

00:06:36.196 --> 00:06:38.356
client hook and you can check on the client side

00:06:38.356 --> 00:06:40.836
like is a user authenticated and then that client

00:06:40.836 --> 00:06:43.236
hook and those client libraries can also like

00:06:43.556 --> 00:06:46.436
basically know you pass in the URL to your server

00:06:46.436 --> 00:06:48.516
and then it handles like all the communication

00:06:48.516 --> 00:06:49.556
with the authentication

00:06:49.676 --> 00:06:52.056
so it abstracts a lot of the boilerplate that you

00:06:52.056 --> 00:06:53.096
need to write on the front end

00:06:53.496 --> 00:06:55.576
and the backend to just get things working.

00:06:55.762 --> 00:06:58.882
Now the reason why I like better off the most is

00:06:58.882 --> 00:06:59.202
because

00:07:00.002 --> 00:07:00.082
I'm

00:07:00.082 --> 00:07:01.722
I mean it does abstract a lot of things away from

00:07:01.722 --> 00:07:03.322
you that's just you don't enjoy doing.

00:07:03.402 --> 00:07:05.322
But the things that like really really matter.

00:07:05.402 --> 00:07:07.082
Like for example payments,

00:07:07.652 --> 00:07:09.412
if you have a specific way that you're doing

00:07:09.412 --> 00:07:11.412
payments and you have specific logic about

00:07:12.102 --> 00:07:15.462
what users are able to like if you have specific

00:07:16.272 --> 00:07:17.352
logic where it's like okay,

00:07:17.352 --> 00:07:18.992
well a user isn't the buyer,

00:07:19.152 --> 00:07:20.752
an organization is the buyer.

00:07:20.832 --> 00:07:21.952
So an organization

00:07:22.752 --> 00:07:24.912
purchases something and then there's users under

00:07:24.912 --> 00:07:25.672
an organization.

00:07:25.672 --> 00:07:27.472
Like if you want to build out that type of logic,

00:07:27.632 --> 00:07:30.472
better Auth has a bunch of plugins and then also a

00:07:30.472 --> 00:07:32.512
plugin framework where you can kind of like roll

00:07:32.512 --> 00:07:34.752
out your own generic way of handling your own

00:07:34.912 --> 00:07:37.590
authenticated permission based business logic.

00:07:37.609 --> 00:07:39.329
So if we head over to the better auth

00:07:39.329 --> 00:07:40.089
documentation

00:07:40.719 --> 00:07:42.719
you can notice down here in plugins there's a

00:07:42.719 --> 00:07:44.319
whole bunch of different things that they have.

00:07:44.399 --> 00:07:44.618
So

00:07:44.905 --> 00:07:47.230
a few different things that I do find useful

00:07:47.400 --> 00:07:49.140
is their organization plugin,

00:07:49.290 --> 00:07:51.450
which basically gives you the ability to manage

00:07:51.610 --> 00:07:52.010
like

00:07:52.510 --> 00:07:54.730
users under a specific organization and then there

00:07:54.730 --> 00:07:56.770
can be like owners of the organization that can

00:07:56.850 --> 00:07:58.210
say hey I want to add this person.

00:07:58.210 --> 00:08:00.330
You can manage the way of like sending out emails

00:08:00.330 --> 00:08:02.650
that has a sign up link and whatnot for,

00:08:02.650 --> 00:08:03.570
for those users.

00:08:03.570 --> 00:08:03.890
So

00:08:04.260 --> 00:08:07.020
MCP which like MCP is kind of a new concept for

00:08:07.020 --> 00:08:07.660
building on top

00:08:08.040 --> 00:08:08.920
large language models.

00:08:08.920 --> 00:08:10.760
But they have like specific ways that

00:08:11.220 --> 00:08:11.580
like hey,

00:08:11.580 --> 00:08:12.980
this is like a great way of implementing

00:08:12.980 --> 00:08:14.380
authentication with MCP Server.

00:08:14.380 --> 00:08:15.740
So they have plugins for that which is pretty

00:08:15.740 --> 00:08:16.000
cool.

00:08:16.000 --> 00:08:16.610
you can just,

00:08:16.610 --> 00:08:18.050
if you want to do like traditional,

00:08:18.050 --> 00:08:20.450
here's an API key and I'm going to like issue API

00:08:20.450 --> 00:08:21.090
keys to

00:08:21.690 --> 00:08:24.050
you know like users of the application and I want

00:08:24.050 --> 00:08:25.770
them to be able to see certain resources they have

00:08:25.770 --> 00:08:26.490
a framework for,

00:08:26.650 --> 00:08:27.832
they have a plugin for that.

00:08:27.832 --> 00:08:29.779
They have stuff for like two factor phone number

00:08:29.779 --> 00:08:30.579
verification

00:08:31.059 --> 00:08:31.699
and then

00:08:32.279 --> 00:08:33.679
on the third party side of things,

00:08:33.679 --> 00:08:33.919
one,

00:08:33.919 --> 00:08:35.519
that one thing that I think is pretty cool is like

00:08:35.519 --> 00:08:35.959
Stripe.

00:08:35.959 --> 00:08:37.239
Now if you have like a super

00:08:37.559 --> 00:08:38.839
basic product where

00:08:39.239 --> 00:08:42.079
you are doing subscription based billing and there

00:08:42.079 --> 00:08:44.159
can be different like subscription tiers and one

00:08:44.159 --> 00:08:45.479
user can buy a subscription,

00:08:45.479 --> 00:08:46.959
this plugin works really really well.

00:08:46.959 --> 00:08:49.039
Now if you're doing really sophisticated things on

00:08:49.039 --> 00:08:51.639
top of stripe like meter based billing or

00:08:52.199 --> 00:08:52.209
account,

00:08:52.419 --> 00:08:53.179
level like

00:08:53.549 --> 00:08:54.959
payment management and whatnot,

00:08:54.959 --> 00:08:56.879
or E commerce where like you're managing lots of

00:08:56.879 --> 00:08:57.359
different products,

00:08:57.599 --> 00:08:59.359
you'd probably want to like roll your own

00:08:59.359 --> 00:08:59.759
solution.

00:08:59.759 --> 00:09:01.839
But you could put your solution under a plugin,

00:09:02.229 --> 00:09:02.869
inside of,

00:09:03.269 --> 00:09:04.389
inside of Better Auth,

00:09:04.469 --> 00:09:06.469
like to kind of fit your specific use case.

00:09:06.469 --> 00:09:08.469
But they do have a lot of things right out of the

00:09:08.469 --> 00:09:08.669
box,

00:09:08.669 --> 00:09:09.392
which is really cool.

00:09:09.449 --> 00:09:12.169
Now I think one of the primary differences between

00:09:12.169 --> 00:09:14.609
Better Auth and a lot of the other providers that

00:09:14.609 --> 00:09:17.009
you've probably heard about if you've been like on

00:09:17.009 --> 00:09:20.289
YouTube watching stuff from like clerk and work OS

00:09:20.289 --> 00:09:22.329
is these are kind of like managed auth solutions,

00:09:22.809 --> 00:09:25.649
which means instead of having like all of your

00:09:25.649 --> 00:09:27.729
user data and your account data and your session

00:09:27.729 --> 00:09:29.449
data sitting in your database

00:09:29.709 --> 00:09:31.619
and that information lives on their servers,

00:09:31.619 --> 00:09:34.739
like on Clerk servers or work OS's servers and you

00:09:34.739 --> 00:09:36.179
know that it can be a clean solution.

00:09:36.179 --> 00:09:38.339
I do think integrations are a little bit easier.

00:09:38.359 --> 00:09:40.239
but whenever you want to do stuff that's like

00:09:40.239 --> 00:09:40.399
really,

00:09:40.399 --> 00:09:40.959
really custom,

00:09:40.959 --> 00:09:42.719
I do think that you're having to like,

00:09:43.039 --> 00:09:43.559
you know,

00:09:43.559 --> 00:09:43.919
like

00:09:44.559 --> 00:09:46.159
create abstractions that

00:09:46.479 --> 00:09:46.970
are like

00:09:46.970 --> 00:09:49.030
further away from your data model and your

00:09:49.030 --> 00:09:49.790
business logic.

00:09:49.790 --> 00:09:51.150
So for a lot of different

00:09:51.880 --> 00:09:52.520
projects,

00:09:52.520 --> 00:09:54.600
I think the vast majority of web apps that you and

00:09:54.600 --> 00:09:55.560
I are going to be building,

00:09:55.720 --> 00:09:57.680
Better Auth I do think is a great solution.

00:09:57.680 --> 00:09:59.440
It's going to be a little bit harder to implement

00:09:59.440 --> 00:10:00.200
than cler,

00:10:00.500 --> 00:10:02.260
but it's going to give you the flexibility to

00:10:02.260 --> 00:10:02.740
build out really,

00:10:02.740 --> 00:10:02.980
really,

00:10:02.980 --> 00:10:03.780
really cool things.

00:10:03.832 --> 00:10:05.746
And the fact that you're integrating it,

00:10:05.746 --> 00:10:07.626
it lives on your database like it's free.

00:10:07.626 --> 00:10:08.546
You know there is no,

00:10:08.546 --> 00:10:09.426
you don't have to like

00:10:09.746 --> 00:10:10.706
have some like,

00:10:11.026 --> 00:10:11.346
oh,

00:10:11.346 --> 00:10:12.626
I get 10,000 users for free,

00:10:12.626 --> 00:10:15.266
then I have to pay some price or like if I want to

00:10:15.266 --> 00:10:17.666
have my own domain associated with my login

00:10:17.666 --> 00:10:17.946
process,

00:10:17.946 --> 00:10:19.386
I have to like pay a fee for that.

00:10:19.386 --> 00:10:19.746
Or

00:10:20.176 --> 00:10:20.596
Clerk.

00:10:20.596 --> 00:10:22.556
If you want to like DO organizations.

00:10:22.636 --> 00:10:23.956
After 100 organizations,

00:10:23.956 --> 00:10:26.116
every organization that is created and has one

00:10:26.116 --> 00:10:27.276
user is $1.

00:10:27.276 --> 00:10:29.516
So like that doesn't really scale pricing wise in

00:10:29.516 --> 00:10:29.916
my op.

00:10:30.118 --> 00:10:32.078
And then just like the ability to have your own

00:10:32.078 --> 00:10:34.758
like really nice looking components that,

00:10:34.838 --> 00:10:36.638
for authentication that blend in with your

00:10:36.638 --> 00:10:37.278
application.

00:10:37.278 --> 00:10:39.678
It's like entirely up to you to implement the

00:10:39.678 --> 00:10:41.118
styling of those components.

00:10:41.118 --> 00:10:42.198
What I've noticed with Clerk,

00:10:42.198 --> 00:10:44.118
a lot of the components that you use right out of

00:10:44.118 --> 00:10:44.558
the box,

00:10:44.558 --> 00:10:46.838
they just don't look great on a website that like

00:10:46.838 --> 00:10:48.918
isn't just like white or just black.

00:10:48.998 --> 00:10:49.638
Like they just,

00:10:49.638 --> 00:10:51.158
if you have like an interesting theme,

00:10:51.478 --> 00:10:52.758
those components don't look good.

00:10:52.838 --> 00:10:54.878
And if you want like the branding of Clerk

00:10:54.878 --> 00:10:55.278
removed,

00:10:55.278 --> 00:10:57.158
you have to like be a premium user.

00:10:57.158 --> 00:10:59.278
So like stuff like that just kind of like turns me

00:10:59.278 --> 00:10:59.478
off.

00:10:59.478 --> 00:11:00.828
If I'm rolling all of my

00:11:01.138 --> 00:11:02.538
solutions from scratch and I'm,

00:11:02.538 --> 00:11:02.858
you know,

00:11:02.858 --> 00:11:03.738
I'm building this stuff out,

00:11:03.738 --> 00:11:05.818
it's like I don't really want to pay for Auth

00:11:05.818 --> 00:11:07.498
unless there's like a true need for it.

00:11:07.498 --> 00:11:10.338
Like if I'm building for enterprises and you know,

00:11:10.338 --> 00:11:10.538
like,

00:11:10.538 --> 00:11:13.658
I want work OS to take a lot of that complexity

00:11:13.658 --> 00:11:14.240
away from me.

00:11:14.240 --> 00:11:16.694
Now the most important thing to understand about

00:11:16.804 --> 00:11:18.954
to understand about Better Auth is

00:11:19.514 --> 00:11:20.994
every single thing that you add.

00:11:20.994 --> 00:11:23.434
Whenever you add like a database,

00:11:23.514 --> 00:11:25.194
whenever you add a plugin,

00:11:25.194 --> 00:11:26.234
whenever you add

00:11:26.324 --> 00:11:27.354
some type of provider,

00:11:27.844 --> 00:11:29.204
essentially what happens is

00:11:29.684 --> 00:11:31.364
under the hood of Better Auth,

00:11:31.444 --> 00:11:33.644
they've created a whole bunch of like SQL

00:11:33.644 --> 00:11:34.724
generators which

00:11:35.044 --> 00:11:37.844
will generate SQL statements that you can,

00:11:37.844 --> 00:11:39.044
or SQL like table,

00:11:39.044 --> 00:11:41.244
create statements that you can run against your

00:11:41.244 --> 00:11:41.804
database.

00:11:41.804 --> 00:11:45.004
So like when you first start with Better Auth,

00:11:45.004 --> 00:11:47.564
you're going to have like a basic user table,

00:11:47.564 --> 00:11:48.244
session table,

00:11:48.244 --> 00:11:48.964
account table,

00:11:49.354 --> 00:11:51.914
and that's going to have like a specific schema.

00:11:51.914 --> 00:11:53.354
Now let's say you bring in a plugin,

00:11:53.354 --> 00:11:54.314
like a stripe plugin,

00:11:54.904 --> 00:11:56.104
you can generate the,

00:11:56.264 --> 00:11:58.824
the necessary tables for that stripe plugin and it

00:11:58.824 --> 00:12:01.824
will also modify your user table with like a

00:12:01.824 --> 00:12:03.384
stripe ID as well.

00:12:03.384 --> 00:12:03.704
So,

00:12:03.704 --> 00:12:04.824
or stripe customer id.

00:12:04.824 --> 00:12:05.384
So like

00:12:06.114 --> 00:12:08.994
they've really thought through how to model data

00:12:09.074 --> 00:12:11.514
for authentication and all of these products.

00:12:11.514 --> 00:12:13.394
And that's something that I really like about this

00:12:13.394 --> 00:12:13.874
is because

00:12:14.514 --> 00:12:16.674
so many times when I'm building out a application,

00:12:16.674 --> 00:12:18.594
I'll kind of like build out this data model for

00:12:18.594 --> 00:12:19.754
managing users and stuff.

00:12:19.754 --> 00:12:20.674
And then over time

00:12:21.454 --> 00:12:22.934
things start to change and I'm like,

00:12:22.934 --> 00:12:23.134
oh,

00:12:23.134 --> 00:12:24.054
I wish I did it differently.

00:12:24.054 --> 00:12:25.614
But because it's your data model,

00:12:25.614 --> 00:12:26.174
it's really,

00:12:26.174 --> 00:12:28.134
really hard to like make substantial changes to

00:12:28.134 --> 00:12:28.414
it.

00:12:28.654 --> 00:12:29.054
But

00:12:29.994 --> 00:12:31.954
Better Auth has done such a good job at like

00:12:31.954 --> 00:12:34.434
saying these are like really really concrete ways

00:12:34.434 --> 00:12:35.514
of handling specific

00:12:35.914 --> 00:12:38.314
authentication use cases that the data models that

00:12:38.314 --> 00:12:40.714
they generate out of the box work really well and

00:12:40.714 --> 00:12:41.434
are actually really,

00:12:41.434 --> 00:12:42.234
really flexible.

00:12:42.394 --> 00:12:44.194
So the very first thing that we're going to do is

00:12:44.194 --> 00:12:46.634
we're going to focus on configuring better auth at

00:12:46.634 --> 00:12:47.594
the base of our project

00:12:47.994 --> 00:12:50.554
so we can create the necessary tables to,

00:12:50.834 --> 00:12:51.554
to add to,

00:12:52.164 --> 00:12:53.844
our D1 database.

00:12:54.244 --> 00:12:56.524
And that's going to basically power the rest of

00:12:56.524 --> 00:12:57.564
our authentication flow.

00:12:57.564 --> 00:12:59.004
Once we have that information in the,

00:12:59.004 --> 00:12:59.820
in our tables,

