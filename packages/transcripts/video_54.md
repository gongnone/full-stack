WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.034 --> 00:00:01.514
So the last thing that we need to do before

00:00:01.514 --> 00:00:04.554
getting into the stripe integration is we need to

00:00:04.554 --> 00:00:06.434
essentially protect different routes that we've

00:00:06.434 --> 00:00:07.554
defined in our application.

00:00:07.634 --> 00:00:10.594
So right now the user isn't able to hit forward

00:00:10.594 --> 00:00:12.834
slash app if they're not logged in.

00:00:13.514 --> 00:00:14.794
but that being said,

00:00:14.794 --> 00:00:17.434
we do have all of these TRPC methods

00:00:17.834 --> 00:00:20.394
that are getting called like from the client and

00:00:20.394 --> 00:00:22.714
then we also have a websocket connection

00:00:23.334 --> 00:00:24.494
that is currently unprotected.

00:00:24.494 --> 00:00:27.494
So essentially anybody could extract those URLs,

00:00:27.844 --> 00:00:29.774
if they know the user's ID somehow they could

00:00:29.774 --> 00:00:31.894
probably go like an extract information about the

00:00:31.894 --> 00:00:32.854
user or about

00:00:33.104 --> 00:00:33.824
like the different,

00:00:33.917 --> 00:00:35.791
or access different resources that we have on our

00:00:35.791 --> 00:00:36.191
server.

00:00:36.191 --> 00:00:38.391
So we're going to want to ensure that

00:00:38.791 --> 00:00:41.751
all of our actual like API endpoints,

00:00:41.751 --> 00:00:42.831
TRPC routes,

00:00:42.831 --> 00:00:43.151
any,

00:00:43.151 --> 00:00:44.391
any server site

00:00:44.951 --> 00:00:46.831
logic that should be protected.

00:00:46.831 --> 00:00:48.231
We're basically going to stick that

00:00:48.241 --> 00:00:48.771
we're going to

00:00:49.261 --> 00:00:51.101
do some authentication logic at that layer.

00:00:51.101 --> 00:00:51.501
So

00:00:51.801 --> 00:00:53.401
what we're going to be using because

00:00:53.881 --> 00:00:55.881
right now if you look at our worker,

00:00:56.551 --> 00:00:58.591
we essentially have this fetch handler and that's

00:00:58.591 --> 00:01:00.951
like offloading the routing to Hono.

00:01:01.111 --> 00:01:02.351
And Hono makes it really,

00:01:02.351 --> 00:01:04.791
really easy to build out some like generic logic

00:01:04.791 --> 00:01:07.631
to do different types of like authentication or

00:01:07.631 --> 00:01:07.951
like

00:01:07.951 --> 00:01:10.391
restrictions based upon information that's coming

00:01:10.391 --> 00:01:10.911
from Auth.

00:01:10.911 --> 00:01:12.871
So I'll kind of explain what that means but just

00:01:12.871 --> 00:01:14.461
to kind of like look at what we have here.

00:01:14.461 --> 00:01:16.261
We have three different routes.

00:01:16.261 --> 00:01:17.421
We have one that is,

00:01:17.501 --> 00:01:19.701
that handles essentially all of our API auth

00:01:19.701 --> 00:01:20.141
stuff.

00:01:20.141 --> 00:01:22.061
we have a client socket and then we have all of

00:01:22.061 --> 00:01:24.181
our TRPC routes that are basically being

00:01:24.181 --> 00:01:25.531
forwarded through into here.

00:01:25.611 --> 00:01:26.011
Now

00:01:26.571 --> 00:01:28.051
what we're going to do is we're going to be

00:01:28.051 --> 00:01:31.051
creating a Hono middleware that essentially sits

00:01:31.291 --> 00:01:33.531
in between the receiving of the request

00:01:34.011 --> 00:01:36.051
and then the actual route itself.

00:01:36.051 --> 00:01:37.611
So when we receive a request,

00:01:37.897 --> 00:01:39.657
currently we don't have this middleware.

00:01:39.657 --> 00:01:41.337
So we get a request and then that,

00:01:41.337 --> 00:01:43.577
that data comes through and it basically goes into

00:01:43.577 --> 00:01:46.417
our fetch handler and then Hono routes it to the

00:01:46.417 --> 00:01:47.257
correct route.

00:01:47.337 --> 00:01:47.737
Now

00:01:48.027 --> 00:01:49.557
what happens with middleware is before

00:01:49.957 --> 00:01:51.957
that request makes it to the route,

00:01:52.197 --> 00:01:55.237
we can define our own custom logic to process that

00:01:55.237 --> 00:01:57.757
request to determine if it should make it to a

00:01:57.757 --> 00:01:59.797
route or if we should like return a 401,

00:01:59.797 --> 00:02:02.117
say this user is not authenticated or throw some

00:02:02.117 --> 00:02:02.957
type of error.

00:02:02.957 --> 00:02:03.317
So

00:02:03.797 --> 00:02:05.517
has like really good documentation on how to

00:02:05.517 --> 00:02:06.317
define middlewares.

00:02:06.317 --> 00:02:07.717
They have a lot of built in middleware that you

00:02:07.717 --> 00:02:08.117
can use.

00:02:08.657 --> 00:02:10.497
They also have the section about Building out

00:02:10.737 --> 00:02:11.709
custom middleware.

00:02:11.709 --> 00:02:14.213
And you can see how you can use custom middleware.

00:02:14.293 --> 00:02:16.693
And then you can also see how you can

00:02:17.193 --> 00:02:19.233
create your own like middleware using this.

00:02:19.233 --> 00:02:20.593
Create middleware factory.

00:02:21.952 --> 00:02:23.672
So this is ultimately what we're going to be

00:02:23.672 --> 00:02:24.152
building out.

00:02:24.152 --> 00:02:26.152
But our use case is going to be different from

00:02:26.152 --> 00:02:28.352
this logger one where we're going to be grabbing

00:02:28.352 --> 00:02:30.392
some information about the user to determine if

00:02:30.392 --> 00:02:31.232
they should like continue

00:02:32.112 --> 00:02:33.092
to be routed.

00:02:33.672 --> 00:02:36.632
so what we're going to do is we are going to,

00:02:36.632 --> 00:02:38.552
at the top level we can go ahead and we can

00:02:38.552 --> 00:02:38.872
import,

00:02:38.952 --> 00:02:39.352
create

00:02:40.312 --> 00:02:40.712
the

00:02:40.892 --> 00:02:42.132
middleware method

00:02:42.452 --> 00:02:45.572
and then I'm going to define a middleware

00:02:46.612 --> 00:02:47.812
and we can call this

00:02:48.152 --> 00:02:49.232
Auth middleware.

00:02:50.062 --> 00:02:52.262
Now essentially what we need to do is we need to

00:02:52.262 --> 00:02:53.102
say await

00:02:53.502 --> 00:02:55.862
next and that's going to pipe the request through.

00:02:55.862 --> 00:02:57.502
And then for now I'm just going to console

00:02:58.352 --> 00:02:58.592
log

00:02:59.712 --> 00:03:00.112
hit

00:03:02.272 --> 00:03:03.632
middleware.

00:03:04.042 --> 00:03:06.962
Now we can essentially define this middleware to

00:03:06.962 --> 00:03:07.242
be

00:03:08.482 --> 00:03:09.282
utilized

00:03:09.602 --> 00:03:12.082
at every single route by attaching it to this app.

00:03:12.162 --> 00:03:14.802
But for our use case we only want to protect TRPC

00:03:15.042 --> 00:03:17.922
and client socket because the API Auth is

00:03:17.922 --> 00:03:19.642
basically handling a whole bunch of stuff for us

00:03:19.642 --> 00:03:20.602
and it's very feasible.

00:03:20.602 --> 00:03:21.762
When the user's not logged in,

00:03:21.762 --> 00:03:24.002
they're going to log in and that data is going to

00:03:24.002 --> 00:03:24.922
flow through here as well.

00:03:24.922 --> 00:03:27.732
So we're going to allow Auth to stay out as it is.

00:03:27.732 --> 00:03:30.142
we're just going to basically try to protect TRPC

00:03:31.452 --> 00:03:33.852
and then we're going to protect the client socket.

00:03:35.052 --> 00:03:36.172
Now I'm going to save this

00:03:36.492 --> 00:03:38.892
and I'm going to go ahead and PNPM our CD into

00:03:38.892 --> 00:03:39.772
user application

00:03:42.572 --> 00:03:44.250
and then PNPM run dev.

00:03:44.250 --> 00:03:44.686
Now this,

00:03:44.686 --> 00:03:45.766
when this spins up

00:03:46.409 --> 00:03:48.706
we'll go ahead and head over to our dashboard

00:03:48.782 --> 00:03:51.582
and we should see middleware hit logs,

00:03:51.592 --> 00:03:53.822
a few different times as this page loads out.

00:03:53.822 --> 00:03:55.622
So basically every single time our

00:03:56.102 --> 00:03:58.902
client application is making requests to TRPC or

00:03:58.902 --> 00:03:59.862
this client socket.

00:04:00.182 --> 00:04:02.202
because we've defined middleware as

00:04:02.802 --> 00:04:04.882
a dependency for these routes

00:04:05.522 --> 00:04:07.642
this request is going to be processed or this

00:04:07.642 --> 00:04:09.482
logic is going to be processed before it makes it

00:04:09.482 --> 00:04:10.482
to this endpoint.

00:04:10.482 --> 00:04:11.442
So you're going to see we

00:04:11.882 --> 00:04:13.642
it hit middleware three different times.

00:04:14.275 --> 00:04:15.755
Now the next thing we're going to have to do

00:04:15.755 --> 00:04:18.435
inside of here is we're going to have to get our

00:04:18.515 --> 00:04:20.435
server side Auth client and

00:04:20.755 --> 00:04:22.835
essentially check if there's a session on it.

00:04:22.835 --> 00:04:25.595
Now we have the logic to get the Auth client here,

00:04:25.595 --> 00:04:27.555
but as this course progresses,

00:04:27.555 --> 00:04:29.755
the information that we pass into here is going to

00:04:29.755 --> 00:04:30.595
Kind of expand.

00:04:30.755 --> 00:04:30.935
So,

00:04:30.935 --> 00:04:30.985
I'm.

00:04:30.985 --> 00:04:32.945
What I'm going to do is I'm going to basically

00:04:33.265 --> 00:04:33.985
have a

00:04:34.305 --> 00:04:36.505
helper method and this probably could live in

00:04:36.505 --> 00:04:38.785
another file in the future if we wanted to.

00:04:39.645 --> 00:04:41.885
but basically what this is going to do is this is

00:04:41.885 --> 00:04:44.205
going to have a method called get auth instance

00:04:44.205 --> 00:04:46.245
and then we are just going to pass in the

00:04:46.245 --> 00:04:47.325
information for the auth

00:04:48.045 --> 00:04:49.038
instance into here.

00:04:49.038 --> 00:04:50.113
And then we can

00:04:50.513 --> 00:04:51.713
go ahead and

00:04:52.715 --> 00:04:54.686
call this get auth instance down here,

00:04:55.566 --> 00:04:56.686
pass an emv.

00:04:59.204 --> 00:05:02.124
And then we could also say at this level we're

00:05:02.124 --> 00:05:03.284
going to say const

00:05:04.164 --> 00:05:04.564
auth

00:05:05.044 --> 00:05:05.604
equals

00:05:06.299 --> 00:05:07.512
get auth instance

00:05:08.300 --> 00:05:11.100
and we will also be passing in C emv.

00:05:12.220 --> 00:05:12.540
Okay,

00:05:12.540 --> 00:05:14.860
so from here we have access to our auth instance.

00:05:14.860 --> 00:05:17.260
So we're just going to go ahead and check if a

00:05:17.260 --> 00:05:18.300
session exists.

00:05:20.060 --> 00:05:24.220
So let's say const session equals await auth API

00:05:24.300 --> 00:05:26.180
getsession and then we basically pass in the

00:05:26.180 --> 00:05:27.260
headers and internally,

00:05:27.419 --> 00:05:28.860
the better auth

00:05:29.120 --> 00:05:31.440
server side logic is going to be taking a look at

00:05:31.440 --> 00:05:33.640
these headers and it's going to pull out the

00:05:33.640 --> 00:05:34.400
session id,

00:05:34.540 --> 00:05:36.420
and it's going to reconcile that against some data

00:05:36.420 --> 00:05:37.444
inside of our database.

00:05:37.932 --> 00:05:39.492
Now I'm going to go ahead and say if we don't have

00:05:39.492 --> 00:05:40.014
a session,

00:05:40.014 --> 00:05:42.859
or let's say if we don't have a session dot user,

00:05:43.020 --> 00:05:45.300
we're going to go ahead and throw a 401

00:05:45.300 --> 00:05:46.320
unauthorized here.

00:05:46.320 --> 00:05:48.678
Then I'm going to go ahead and pull out the user

00:05:48.678 --> 00:05:50.238
ID into its own variable.

00:05:50.478 --> 00:05:51.758
And then we're going to say C

00:05:52.078 --> 00:05:52.478
set

00:05:52.958 --> 00:05:53.914
user ID here.

00:05:54.019 --> 00:05:56.387
And what this set is doing is it's basically

00:05:56.387 --> 00:05:58.987
allowing us to attach information to the context

00:05:59.147 --> 00:06:01.567
so it can be accessed inside of these other routes

00:06:01.567 --> 00:06:02.327
very easily.

00:06:02.407 --> 00:06:02.687
Now,

00:06:02.687 --> 00:06:04.066
in order to make this type safe,

00:06:04.066 --> 00:06:06.822
we can go ahead and we can say variables,

00:06:08.616 --> 00:06:10.396
and then we're going to define user

00:06:12.876 --> 00:06:13.836
as a string.

00:06:14.652 --> 00:06:16.979
And then if we head over to the trpc,

00:06:16.979 --> 00:06:19.499
we could basically say const user ID

00:06:20.379 --> 00:06:22.299
equals c dot get

00:06:23.429 --> 00:06:24.709
and this should be type safe.

00:06:24.709 --> 00:06:26.549
So it should autocomplete with user id.

00:06:27.109 --> 00:06:28.709
And then we're going to basically be doing the

00:06:28.709 --> 00:06:29.429
same thing for

00:06:29.749 --> 00:06:30.149
the

00:06:30.369 --> 00:06:31.029
Click socket.

00:06:31.029 --> 00:06:31.829
Now click socket.

00:06:31.829 --> 00:06:32.869
This integration is going to be very,

00:06:32.869 --> 00:06:35.269
very easy because you can see we are setting these

00:06:35.269 --> 00:06:35.749
headers,

00:06:35.809 --> 00:06:36.669
with the account id,

00:06:36.669 --> 00:06:38.668
and that account ID is basically internally what

00:06:38.668 --> 00:06:39.829
we're saying is the user id.

00:06:40.239 --> 00:06:42.319
the reason why we're distinguishing between like

00:06:42.319 --> 00:06:42.559
account,

00:06:42.559 --> 00:06:44.679
we're calling the account ID a user ID is imagine

00:06:44.679 --> 00:06:45.359
if you have

00:06:45.679 --> 00:06:47.759
some type of application where instead of like

00:06:47.999 --> 00:06:50.159
partitioning the data at a user level,

00:06:50.319 --> 00:06:52.359
you basically make it an account level or an

00:06:52.359 --> 00:06:54.699
organization level and you can say everybod under

00:06:54.699 --> 00:06:56.379
this organization can see this data.

00:06:56.459 --> 00:06:58.859
So instead of filtering internally by

00:06:59.259 --> 00:06:59.659
the

00:07:00.199 --> 00:07:00.999
the user id,

00:07:00.999 --> 00:07:02.199
you'd pass in a different id.

00:07:02.199 --> 00:07:03.079
But for our use case,

00:07:03.159 --> 00:07:06.119
the application is isolated to a specific user.

00:07:06.359 --> 00:07:07.919
So we're just going to go ahead and we're going to

00:07:07.919 --> 00:07:09.319
throw this data into here.

00:07:10.299 --> 00:07:13.739
And then if we drill into this create context,

00:07:13.845 --> 00:07:15.676
you're going to notice we have this hard coded

00:07:15.676 --> 00:07:16.756
user ID as well.

00:07:16.836 --> 00:07:18.356
So we're just going to go ahead and say

00:07:19.036 --> 00:07:19.916
user ID

00:07:20.270 --> 00:07:22.539
and then we'll also make sure we have it as a type

00:07:25.698 --> 00:07:27.738
and then we're going to be passing it into here.

00:07:29.178 --> 00:07:29.288
Now,

00:07:29.288 --> 00:07:30.898
the last thing we need to do is we need to take

00:07:30.898 --> 00:07:33.018
our user ID and we need to make sure we pass it

00:07:33.018 --> 00:07:34.298
into this create context.

00:07:34.298 --> 00:07:34.898
Helper.

00:07:37.186 --> 00:07:38.346
So I just deleted the,

00:07:38.346 --> 00:07:40.746
I just did some cleanup work and deleted the log

00:07:40.746 --> 00:07:42.546
statements under AUTH middleware.

00:07:42.625 --> 00:07:45.106
And this is a good opportunity to deploy the

00:07:45.106 --> 00:07:45.466
changes.

00:07:45.466 --> 00:07:47.466
Whether you want to do this through the CLI or you

00:07:47.466 --> 00:07:49.626
want to push these changes to the master branch

00:07:49.626 --> 00:07:50.706
and have Our automated

00:07:51.386 --> 00:07:53.466
CI CD pipeline or our GitHub action,

00:07:54.066 --> 00:07:55.066
deploy that change for you.

00:07:55.066 --> 00:07:55.906
I'm just going to say

00:07:57.186 --> 00:07:58.146
PNPM

00:07:59.873 --> 00:08:00.273
run

00:08:01.553 --> 00:08:02.993
stagedeploy

00:08:05.456 --> 00:08:07.592
and what we should note here is after we do the

00:08:07.592 --> 00:08:10.112
stage deploy or I'll also do a production deploy.

00:08:10.112 --> 00:08:11.460
This is a production version of the app.

00:08:11.460 --> 00:08:13.916
We have these links that are created and it's

00:08:13.916 --> 00:08:16.116
still using the hard coded user ID on the back

00:08:16.116 --> 00:08:16.436
end.

00:08:16.866 --> 00:08:18.786
So if we go ahead and deploy this to production,

00:08:19.156 --> 00:08:21.146
those links should also go away and we'll have to

00:08:21.146 --> 00:08:23.146
kind of create some new links for our test data

00:08:23.146 --> 00:08:23.336
here.

00:08:23.336 --> 00:08:24.398
So let's go ahead and do that.

00:08:24.398 --> 00:08:25.718
I'm going to also say,

00:08:26.038 --> 00:08:28.518
so that deployed to stage PNPM run,

00:08:29.708 --> 00:08:30.378
production

00:08:30.938 --> 00:08:31.525
deploy

00:08:31.525 --> 00:08:33.456
and then now when we head over to our production

00:08:33.456 --> 00:08:33.776
version,

00:08:33.776 --> 00:08:35.096
we no longer have

00:08:35.166 --> 00:08:35.836
those links.

00:08:35.836 --> 00:08:38.396
So essentially our authentication is fully built

00:08:38.396 --> 00:08:40.876
out and now we're going to move into the stripe

00:08:40.876 --> 00:08:41.956
payment side of things.

