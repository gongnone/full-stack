WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.356 --> 00:00:00.716
All right,

00:00:00.716 --> 00:00:02.836
so we finally got to the part of the course that's

00:00:02.836 --> 00:00:03.476
actually fun.

00:00:03.476 --> 00:00:05.116
We're going to actually start building everything

00:00:05.116 --> 00:00:06.796
out and we're going to learn by doing,

00:00:06.796 --> 00:00:08.516
which honestly is the best way to learn.

00:00:08.516 --> 00:00:10.356
Instead of me just like lecturing for the next 12

00:00:10.356 --> 00:00:10.636
hours,

00:00:10.636 --> 00:00:11.636
we're going to dive very,

00:00:11.636 --> 00:00:14.236
very deep into a code and we're going to start

00:00:14.236 --> 00:00:16.356
with the front end and we're going to slowly start

00:00:16.356 --> 00:00:17.476
moving our way to the back end.

00:00:17.716 --> 00:00:19.636
The further back that we go into the stack,

00:00:19.716 --> 00:00:22.276
the more in depth the material is going to get.

00:00:22.356 --> 00:00:24.676
So if you're overwhelmed by how fast we go over

00:00:24.676 --> 00:00:25.316
the front end,

00:00:25.476 --> 00:00:26.156
that's okay.

00:00:26.156 --> 00:00:27.656
I kind of expect that the.

00:00:27.806 --> 00:00:30.606
This course is meant to be a framework agnostic

00:00:30.606 --> 00:00:32.286
look at how to build on top of cloudflare,

00:00:32.286 --> 00:00:34.366
so you can bring whatever framework you want and

00:00:34.526 --> 00:00:36.406
it's geared towards helping you really understand

00:00:36.406 --> 00:00:38.086
how to build a service on the back end.

00:00:38.086 --> 00:00:39.646
So we're going to go through the front end.

00:00:39.646 --> 00:00:40.566
We're going to look at,

00:00:40.566 --> 00:00:40.926
like,

00:00:40.926 --> 00:00:41.326
how

00:00:41.438 --> 00:00:43.129
page navigation works and the different

00:00:43.129 --> 00:00:44.170
technologies that we use.

00:00:44.170 --> 00:00:45.810
But don't be too overwhelmed if you don't

00:00:45.810 --> 00:00:46.930
understand a lot of this,

00:00:46.930 --> 00:00:48.930
just because that's not what we're trying to do.

00:00:48.930 --> 00:00:50.290
We're not trying to teach you how to use this

00:00:50.290 --> 00:00:50.690
framework,

00:00:50.690 --> 00:00:52.090
we're not going to try to teach you how to use

00:00:52.090 --> 00:00:53.290
REACT and trpc.

00:00:53.290 --> 00:00:54.730
I just want to show you how we're using it.

00:00:54.890 --> 00:00:55.050
And,

00:00:55.120 --> 00:00:56.520
and then that's going to kind of help solidify

00:00:56.520 --> 00:00:58.480
this project structure and how to navigate things.

00:00:58.560 --> 00:01:00.520
So what we're going to do is we're going to head

00:01:00.520 --> 00:01:01.282
over to Apps

00:01:01.282 --> 00:01:02.242
User Application,

00:01:02.242 --> 00:01:03.162
which is our front end,

00:01:03.162 --> 00:01:05.162
and then we're also going to CD into that

00:01:05.162 --> 00:01:06.162
directory as well.

00:01:06.162 --> 00:01:07.082
So Apps

00:01:07.562 --> 00:01:10.082
User Application and then we're going to say PNPM

00:01:10.082 --> 00:01:10.682
run dev.

00:01:10.682 --> 00:01:12.362
So this is going to boot up our application.

00:01:12.842 --> 00:01:14.202
If we come over here,

00:01:14.202 --> 00:01:16.642
we'll go to that homepage on Port 3000,

00:01:16.642 --> 00:01:18.282
which is where our application is running,

00:01:18.282 --> 00:01:19.962
and you can see that this is the homepage.

00:01:19.962 --> 00:01:20.316
Now,

00:01:20.414 --> 00:01:22.334
when you click on Get Started for Free,

00:01:22.734 --> 00:01:25.854
it navigates us over to the forward slash app,

00:01:26.094 --> 00:01:29.734
which is kind of like the dashboard section of the

00:01:29.734 --> 00:01:32.414
user application is kind of like where the users

00:01:32.414 --> 00:01:32.734
are,

00:01:33.274 --> 00:01:35.153
doing like managing the links and actually

00:01:35.153 --> 00:01:36.434
interacting with the application.

00:01:36.674 --> 00:01:38.434
This is also towards the end of the course,

00:01:38.434 --> 00:01:40.514
we're going to implement some authentication.

00:01:40.514 --> 00:01:42.834
So forward slash app will be protected only

00:01:42.834 --> 00:01:45.634
authenticated logged in users will be able to view

00:01:45.864 --> 00:01:46.984
the contents of this page.

00:01:47.624 --> 00:01:49.464
So how are we doing this right now?

00:01:49.464 --> 00:01:49.704
This,

00:01:49.704 --> 00:01:51.944
this application is set up on a very,

00:01:51.944 --> 00:01:52.784
it's actually very simple,

00:01:52.784 --> 00:01:53.544
it's just React,

00:01:53.704 --> 00:01:56.864
it's using Tanstack router for page navigation and

00:01:56.864 --> 00:01:58.664
then the data being passed and forth from the

00:01:58.664 --> 00:02:01.344
front end to the back end is provided by trpc

00:02:01.344 --> 00:02:03.704
which is running on a really lightweight worker on

00:02:03.704 --> 00:02:04.664
cloudflare workers.

00:02:04.744 --> 00:02:06.344
So we'll kind of get into that right now.

00:02:06.344 --> 00:02:07.817
Now if you head over to source

00:02:07.817 --> 00:02:08.924
and you look at Routes,

00:02:09.244 --> 00:02:10.364
if you're familiar with Next,

00:02:10.364 --> 00:02:12.194
JS is a very similar convention.

00:02:12.194 --> 00:02:13.644
the only difference is we don't have like

00:02:14.254 --> 00:02:16.154
dot page page dot tsx.

00:02:16.154 --> 00:02:17.004
that's not the convention.

00:02:17.004 --> 00:02:17.684
It's basically

00:02:18.004 --> 00:02:19.364
any file name

00:02:19.684 --> 00:02:22.484
inside of Routes becomes its own page.

00:02:22.724 --> 00:02:23.124
And

00:02:23.844 --> 00:02:26.284
what you can see here is this is the index inside

00:02:26.284 --> 00:02:26.804
of app

00:02:26.819 --> 00:02:28.072
and this is the home page.

00:02:28.392 --> 00:02:29.952
And then if you look at app,

00:02:29.952 --> 00:02:31.912
so forward slash app would be the path,

00:02:32.312 --> 00:02:34.372
inside of this auth underscore auth.

00:02:34.372 --> 00:02:36.212
So because this is protected we'll kind of get

00:02:36.212 --> 00:02:37.772
into how this works later in the course.

00:02:37.772 --> 00:02:41.012
But inside of Auth we have this index tsx

00:02:41.412 --> 00:02:43.052
and that is this page right here.

00:02:43.052 --> 00:02:45.372
The actual dashboard that we're seeing now this

00:02:45.372 --> 00:02:47.412
dashboard is pulling data from

00:02:47.912 --> 00:02:51.308
a variety of TRBC endpoints on the back end.

00:02:51.628 --> 00:02:53.068
And what you're going to notice is

00:02:53.548 --> 00:02:55.668
it's a very common convention where we have a

00:02:55.668 --> 00:02:56.188
loader,

00:02:56.428 --> 00:02:58.028
which is a 10 stack

00:02:58.208 --> 00:02:58.848
router

00:02:59.168 --> 00:03:01.968
convention where essentially when the page loads

00:03:02.368 --> 00:03:04.328
all of this logic gets executed.

00:03:04.328 --> 00:03:05.808
And this logic is basically

00:03:06.238 --> 00:03:08.678
prefetching a whole bunch of data that's living in

00:03:08.678 --> 00:03:08.878
a,

00:03:08.878 --> 00:03:10.758
that's living behind a TRPC route.

00:03:10.758 --> 00:03:13.678
So that's living behind a backend handler that's

00:03:13.678 --> 00:03:15.198
going to be pulling data from a database,

00:03:15.278 --> 00:03:16.718
providing it back to the front end.

00:03:16.958 --> 00:03:17.518
And then

00:03:18.848 --> 00:03:20.208
we're going to have a whole bunch of these

00:03:20.208 --> 00:03:21.048
different components.

00:03:21.048 --> 00:03:22.208
So we have these cards,

00:03:22.208 --> 00:03:24.448
these metric cards and we have some of these

00:03:24.448 --> 00:03:24.968
tables.

00:03:24.968 --> 00:03:27.488
So if we come down here and we look at top

00:03:27.488 --> 00:03:28.368
countries table,

00:03:28.688 --> 00:03:30.048
which is this table right here,

00:03:30.368 --> 00:03:31.568
we can drill into that

00:03:32.044 --> 00:03:34.285
and you can see this is just a very typical J R

00:03:34.285 --> 00:03:35.365
TSX component

00:03:35.825 --> 00:03:36.265
React.

00:03:36.745 --> 00:03:37.625
Now the

00:03:37.945 --> 00:03:40.545
main difference here is we're actually like

00:03:40.545 --> 00:03:41.145
fetching data,

00:03:41.385 --> 00:03:43.265
but we're not fetching data in the traditional

00:03:43.265 --> 00:03:44.985
sense of like making an API call,

00:03:44.985 --> 00:03:45.745
handling the data,

00:03:45.745 --> 00:03:47.625
parsing everything and then passing it through.

00:03:48.105 --> 00:03:50.305
We have a very simplified version of like how

00:03:50.305 --> 00:03:51.785
we're grabbing data from the back end.

00:03:51.785 --> 00:03:53.065
And this is using

00:03:53.345 --> 00:03:55.435
Use query from Tanstack.

00:03:55.675 --> 00:03:57.755
Now this is honestly probably the most popular

00:03:57.985 --> 00:04:00.945
powerful data fetching library I've ever seen or

00:04:00.945 --> 00:04:01.265
used.

00:04:01.345 --> 00:04:04.505
And I feel stupid that I wasn't using it earlier

00:04:04.505 --> 00:04:06.385
in my career and I'll show you why.

00:04:06.465 --> 00:04:07.345
So if you,

00:04:07.345 --> 00:04:09.185
if you're familiar with Tanstack query,

00:04:09.425 --> 00:04:10.905
you can just kind of forward through this.

00:04:10.905 --> 00:04:12.225
But if you're not,

00:04:12.385 --> 00:04:12.905
honestly,

00:04:12.905 --> 00:04:14.465
I think I'm going to change the way that you're

00:04:14.465 --> 00:04:15.985
going to develop like how you're going to

00:04:15.985 --> 00:04:16.625
implement fetching,

00:04:16.625 --> 00:04:18.385
fetching logic inside of your applications.

00:04:18.545 --> 00:04:20.025
And it doesn't matter what framework,

00:04:20.025 --> 00:04:22.985
like they have a svelte version of it,

00:04:22.985 --> 00:04:23.505
they have

00:04:23.765 --> 00:04:24.085
Vue,

00:04:24.085 --> 00:04:25.045
they have Solid.

00:04:25.045 --> 00:04:25.565
And if,

00:04:25.565 --> 00:04:26.565
obviously if you work in.

00:04:26.565 --> 00:04:26.765
Net,

00:04:26.765 --> 00:04:27.325
in React,

00:04:27.565 --> 00:04:28.965
they have the React version of it,

00:04:28.965 --> 00:04:30.905
which is kind of like the first one that came out.

00:04:30.905 --> 00:04:31.305
So

00:04:32.025 --> 00:04:34.545
when you have a front end component and that

00:04:34.545 --> 00:04:36.625
component mounts for the first time and you need

00:04:36.625 --> 00:04:37.945
to go get data from a backend,

00:04:37.945 --> 00:04:40.305
this is a very typical pattern and honestly it's

00:04:40.305 --> 00:04:40.585
wrong.

00:04:40.585 --> 00:04:42.665
But this is how I see so many people do it,

00:04:42.745 --> 00:04:43.865
even at large companies,

00:04:44.105 --> 00:04:45.225
like working at a large company.

00:04:45.225 --> 00:04:47.065
I can't tell you how many times I've seen code

00:04:47.145 --> 00:04:47.745
just like this.

00:04:47.745 --> 00:04:49.345
And honestly I think I've written code like this

00:04:49.345 --> 00:04:50.105
in the past when I,

00:04:50.105 --> 00:04:51.905
when I started out and was kind of newer.

00:04:51.905 --> 00:04:54.745
So you have like a users component that

00:04:55.115 --> 00:04:57.715
when it mounts it has a use effect and then that

00:04:57.715 --> 00:05:00.995
use effect has a asynchronous data call to a

00:05:00.995 --> 00:05:01.515
backend.

00:05:01.515 --> 00:05:02.844
And because you can't like

00:05:02.844 --> 00:05:05.482
cleanly define an async function inside of a use

00:05:05.482 --> 00:05:05.802
effect,

00:05:05.802 --> 00:05:08.602
you have to define the fetch users function and

00:05:08.602 --> 00:05:10.842
then also call it inside of the use effect,

00:05:10.922 --> 00:05:12.642
which is just kind of tedious.

00:05:12.642 --> 00:05:13.002
But

00:05:13.892 --> 00:05:15.612
essentially what you want to do is you want to get

00:05:15.612 --> 00:05:18.412
some data from this user's endpoint and then you

00:05:18.412 --> 00:05:20.692
want to populate a user state.

00:05:20.852 --> 00:05:22.372
So you fetch some data

00:05:22.982 --> 00:05:24.022
and when you get the data,

00:05:24.342 --> 00:05:25.542
you set user.

00:05:25.542 --> 00:05:27.462
So you set data users to the

00:05:27.492 --> 00:05:29.752
response back from the API and then that is

00:05:29.752 --> 00:05:31.312
rendered in the UI down here.

00:05:31.712 --> 00:05:33.752
Now that API call might take a few seconds.

00:05:33.752 --> 00:05:34.792
So if it takes a few seconds,

00:05:34.792 --> 00:05:35.392
what do you do?

00:05:35.392 --> 00:05:36.512
You need some loading state,

00:05:36.512 --> 00:05:36.792
right?

00:05:36.792 --> 00:05:38.152
So your application is a little bit more

00:05:38.152 --> 00:05:38.832
interactive.

00:05:38.832 --> 00:05:41.512
So you throw in an is loading function or an is

00:05:41.512 --> 00:05:42.112
loading state,

00:05:43.322 --> 00:05:43.812
object.

00:05:44.132 --> 00:05:46.932
So then it's set to true and then the data call

00:05:46.932 --> 00:05:48.852
happens and then once all that stuff is done,

00:05:48.852 --> 00:05:50.372
then you set it default and when it's,

00:05:50.492 --> 00:05:51.012
when it's true,

00:05:51.012 --> 00:05:52.852
you have a little loading indicator and when it's

00:05:52.852 --> 00:05:53.212
false,

00:05:53.212 --> 00:05:54.652
that loading indicator goes away.

00:05:54.812 --> 00:05:55.972
And then if there's an error,

00:05:55.972 --> 00:05:57.252
if that API error is out,

00:05:57.252 --> 00:05:58.212
the Server's down or something.

00:05:58.212 --> 00:05:59.172
You also want to,

00:05:59.172 --> 00:05:59.532
you know,

00:05:59.532 --> 00:06:00.932
have a clean error message as well.

00:06:00.932 --> 00:06:02.972
So you throw in another state variable.

00:06:02.972 --> 00:06:04.252
Now this code is honestly,

00:06:04.252 --> 00:06:04.842
it's pretty bad.

00:06:04.842 --> 00:06:05.891
and if you don't know why it's bad,

00:06:05.891 --> 00:06:06.652
that's really fine.

00:06:06.652 --> 00:06:08.572
But I want to show you how to make it so much

00:06:08.572 --> 00:06:08.892
better.

00:06:09.412 --> 00:06:10.772
one of the issues here is

00:06:11.092 --> 00:06:11.772
this data,

00:06:11.772 --> 00:06:13.532
this user's data isn't type safe.

00:06:13.532 --> 00:06:16.532
We don't know if user has a name or if user has a

00:06:16.532 --> 00:06:19.212
last name or if it's camel case or if they have an

00:06:19.212 --> 00:06:19.452
email.

00:06:19.452 --> 00:06:19.732
Right,

00:06:19.732 --> 00:06:20.252
we don't know that.

00:06:20.252 --> 00:06:22.192
And we'll have to like console log it out to even

00:06:22.192 --> 00:06:23.232
see what data is available.

00:06:23.812 --> 00:06:25.092
and if that data changes,

00:06:25.092 --> 00:06:26.892
we also don't know like we're just going to have

00:06:26.892 --> 00:06:27.812
errors in our application.

00:06:27.812 --> 00:06:29.052
That's the only way we're going to find things

00:06:29.052 --> 00:06:29.332
out.

00:06:29.502 --> 00:06:31.902
if this fails and we want to refetch,

00:06:31.902 --> 00:06:34.462
we don't have any clean retry logic as well.

00:06:35.032 --> 00:06:37.512
these are things that 10 stack query are going to

00:06:37.512 --> 00:06:38.552
help tremendously with.

00:06:38.632 --> 00:06:41.032
So if we look at this code,

00:06:41.112 --> 00:06:41.592
you know,

00:06:41.592 --> 00:06:42.632
kind of like solidify,

00:06:42.632 --> 00:06:42.992
use,

00:06:42.992 --> 00:06:44.152
effect function,

00:06:44.232 --> 00:06:44.872
set state,

00:06:45.112 --> 00:06:46.472
render stuff based on state.

00:06:47.102 --> 00:06:48.862
Now let's look at a cleaner version of this.

00:06:49.262 --> 00:06:51.822
A cleaner version of this using Tanstack query

00:06:51.822 --> 00:06:52.622
would look like this.

00:06:52.702 --> 00:06:54.622
You move your fetch function out.

00:06:54.782 --> 00:06:56.822
So the function that's actually interfacing with

00:06:56.822 --> 00:06:57.582
your API,

00:06:57.822 --> 00:07:00.582
bringing data down and then providing that data to

00:07:00.582 --> 00:07:01.862
the front end is kind of moved out.

00:07:01.862 --> 00:07:03.302
You probably put this in a different file,

00:07:03.302 --> 00:07:03.702
honestly,

00:07:03.702 --> 00:07:05.822
and then it could be reused in other components.

00:07:06.142 --> 00:07:08.222
And then you have a Tanstack,

00:07:08.642 --> 00:07:09.522
react query,

00:07:09.682 --> 00:07:11.522
a usequery method.

00:07:11.682 --> 00:07:14.122
And essentially what's happening here is you're

00:07:14.122 --> 00:07:15.322
going to specify a query key.

00:07:15.322 --> 00:07:17.882
So this query key is going to be unique to a

00:07:17.882 --> 00:07:18.242
query,

00:07:18.622 --> 00:07:19.262
a given query.

00:07:19.422 --> 00:07:21.262
And the reason why you want a query key is

00:07:21.342 --> 00:07:23.382
Tanstack actually does some caching on the front

00:07:23.382 --> 00:07:23.662
end.

00:07:23.742 --> 00:07:25.902
So if you have multiple components that require

00:07:25.902 --> 00:07:26.862
data from the same

00:07:27.062 --> 00:07:29.622
from the same API in the same endpoint with the

00:07:29.622 --> 00:07:30.342
same input,

00:07:30.582 --> 00:07:32.502
instead of continuously fetching data from the

00:07:32.502 --> 00:07:32.822
back end,

00:07:32.822 --> 00:07:33.262
you can,

00:07:33.262 --> 00:07:34.982
you can basically configure this to say,

00:07:34.982 --> 00:07:35.382
hey,

00:07:35.762 --> 00:07:37.922
the data is only of a few seconds old,

00:07:37.922 --> 00:07:38.882
don't refetch it,

00:07:38.882 --> 00:07:40.042
just pull it from cache.

00:07:40.042 --> 00:07:40.822
there's a whole,

00:07:41.062 --> 00:07:41.582
you know,

00:07:41.582 --> 00:07:42.982
very like intricate

00:07:43.482 --> 00:07:45.402
caching configuration that we're not going to dive

00:07:45.402 --> 00:07:45.882
too deep into.

00:07:45.882 --> 00:07:47.642
Just know it exists and you can look at,

00:07:47.642 --> 00:07:49.462
you can look into like how to configure that

00:07:49.602 --> 00:07:50.364
on your own time.

00:07:50.364 --> 00:07:52.982
And then the other thing that we need is a fetch

00:07:52.982 --> 00:07:53.462
function.

00:07:53.622 --> 00:07:54.582
And the fetch function,

00:07:54.582 --> 00:07:56.422
you just basically pass in the function.

00:07:56.422 --> 00:07:57.182
You don't call it,

00:07:57.182 --> 00:07:57.662
you just pass,

00:07:57.662 --> 00:07:57.982
you say,

00:07:57.982 --> 00:07:58.982
this is my function.

00:07:58.982 --> 00:07:59.382
And

00:07:59.782 --> 00:08:01.542
when this components mounts,

00:08:01.942 --> 00:08:04.182
this function is going to be invoked and

00:08:04.442 --> 00:08:06.762
tan stack query is going to basically say like,

00:08:06.762 --> 00:08:07.042
okay,

00:08:07.042 --> 00:08:08.802
do I need to fetch data or do I already have data

00:08:08.802 --> 00:08:09.522
in cache?

00:08:09.522 --> 00:08:11.002
And if I already have data in cache,

00:08:11.002 --> 00:08:11.602
you can say,

00:08:11.602 --> 00:08:12.962
show that data in cache,

00:08:13.202 --> 00:08:15.282
but while that data is shown on the page,

00:08:15.442 --> 00:08:18.002
go get some other data and then I'm going to

00:08:18.002 --> 00:08:18.802
update that for you.

00:08:18.802 --> 00:08:19.522
So all of these things,

00:08:19.522 --> 00:08:21.362
like you can configure that logic,

00:08:21.682 --> 00:08:23.802
but if you just use it right out of the box,

00:08:23.802 --> 00:08:25.562
you'll notice all of a sudden your UI becomes more

00:08:25.562 --> 00:08:27.282
snappy and way easier to manage.

00:08:27.362 --> 00:08:29.602
You'll also notice that you have an is loading

00:08:29.852 --> 00:08:32.358
property as well as part of use query

00:08:32.358 --> 00:08:33.600
and you have an error,

00:08:34.480 --> 00:08:35.800
you have an error flag as well.

00:08:35.800 --> 00:08:36.080
So

00:08:36.400 --> 00:08:38.680
just in this little tiny bit of code you're able

00:08:38.680 --> 00:08:39.280
to go from,

00:08:39.664 --> 00:08:40.784
you'll be able to go from this

00:08:41.584 --> 00:08:42.624
simplified to this.

00:08:42.704 --> 00:08:43.904
You have your reach.

00:08:43.984 --> 00:08:46.384
Also I didn't mention if this fails,

00:08:46.464 --> 00:08:48.384
by default it'll retry for you.

00:08:48.384 --> 00:08:50.384
And I think it retries like four times and each

00:08:50.384 --> 00:08:52.864
retry kind of backs off exponentially.

00:08:52.864 --> 00:08:53.344
So like

00:08:53.744 --> 00:08:54.983
it'll retry immediately,

00:08:54.983 --> 00:08:56.304
it'll wait a second retry,

00:08:56.304 --> 00:08:58.264
it'll wait a few more seconds and then retry kind

00:08:58.264 --> 00:08:58.664
of a thing.

00:08:58.664 --> 00:09:00.514
and then you can disable that if you don't want

00:09:00.514 --> 00:09:01.074
that logic.

00:09:01.074 --> 00:09:03.154
But and then another thing is like if you move

00:09:03.154 --> 00:09:03.594
tabs,

00:09:03.594 --> 00:09:04.714
you come to like another tab,

00:09:04.714 --> 00:09:05.714
it can come back to it.

00:09:06.224 --> 00:09:07.064
It'll also like,

00:09:07.064 --> 00:09:08.904
by default it'll refetch data as well.

00:09:08.904 --> 00:09:10.224
So like data can stay,

00:09:10.404 --> 00:09:12.524
not so data won't be stale on your ui,

00:09:12.524 --> 00:09:13.604
which is also super cool.

00:09:13.604 --> 00:09:13.924
So

00:09:14.324 --> 00:09:16.244
just know how much more simple this is.

00:09:16.244 --> 00:09:17.484
You're able to handle loading,

00:09:17.484 --> 00:09:19.164
you're able to handle the error based upon the

00:09:19.164 --> 00:09:21.364
properties that use that use query provides to

00:09:21.364 --> 00:09:21.604
you.

00:09:21.844 --> 00:09:24.244
Now TRPC takes this a step further,

00:09:24.324 --> 00:09:26.924
makes it simple and like way easier to work with.

00:09:26.924 --> 00:09:28.724
The main reason to me is

00:09:29.044 --> 00:09:31.564
instead of like reaching out to an API that you

00:09:31.564 --> 00:09:34.044
don't know the shape of and it could change on the

00:09:34.044 --> 00:09:34.404
back end,

00:09:34.404 --> 00:09:35.724
that shape could change on the back end,

00:09:35.724 --> 00:09:37.004
and then the front end doesn't know.

00:09:37.004 --> 00:09:38.844
I mean it shouldn't change on the back end if you

00:09:38.844 --> 00:09:39.724
design a good API.

00:09:39.724 --> 00:09:40.044
But

00:09:40.524 --> 00:09:41.244
it happens,

00:09:41.250 --> 00:09:42.235
your UI doesn't know.

00:09:42.235 --> 00:09:44.435
So like some data you get Data that's unexpected

00:09:44.435 --> 00:09:46.475
on the front end and things start breaking and you

00:09:46.475 --> 00:09:48.835
don't know until users or your monitoring tool

00:09:48.835 --> 00:09:49.555
picks it up.

00:09:49.715 --> 00:09:52.395
Now TRPC takes us a step further where essentially

00:09:52.395 --> 00:09:53.875
what it says is instead of having this,

00:09:53.875 --> 00:09:54.915
this REST API,

00:09:54.995 --> 00:09:57.115
we're going to wrap your API in some like type

00:09:57.115 --> 00:09:58.995
safe logic so you can define the front end,

00:09:58.995 --> 00:09:59.795
the the input

00:10:00.095 --> 00:10:02.575
and the output and then you'll use a client that

00:10:02.575 --> 00:10:04.575
has context to the shape of that data.

00:10:04.735 --> 00:10:06.175
So that's what this would look like.

00:10:06.735 --> 00:10:07.862
So just imagine here

00:10:08.078 --> 00:10:08.718
you have,

00:10:08.718 --> 00:10:09.118
so

00:10:09.438 --> 00:10:11.638
if you look here we're importing a TRPC client.

00:10:11.638 --> 00:10:13.198
This is just kind of pseudocode

00:10:13.598 --> 00:10:14.158
and then

00:10:14.798 --> 00:10:18.438
the client knows that I have a user's route and

00:10:18.438 --> 00:10:20.798
that users route has a method called get all.

00:10:21.278 --> 00:10:23.838
And you might notice here is this use query.

00:10:24.078 --> 00:10:26.398
We're not explicitly defining a query key

00:10:26.798 --> 00:10:28.078
and a query function.

00:10:28.158 --> 00:10:29.678
So we're not defining these two.

00:10:29.824 --> 00:10:31.154
We're using this query

00:10:31.724 --> 00:10:32.204
options,

00:10:32.204 --> 00:10:35.004
which is a newer way of using react query

00:10:35.324 --> 00:10:35.724
with

00:10:35.944 --> 00:10:36.904
trpc.

00:10:37.384 --> 00:10:38.864
So it's taking care of that for us.

00:10:38.864 --> 00:10:40.984
It's basically providing the query function that

00:10:40.984 --> 00:10:41.704
needs to be called

00:10:42.024 --> 00:10:44.024
and it's also providing a unique key,

00:10:44.444 --> 00:10:46.404
that way you don't have to memorize and keep in

00:10:46.404 --> 00:10:48.124
your head of like which keys you're using,

00:10:48.124 --> 00:10:49.164
which is also super,

00:10:49.164 --> 00:10:49.804
super nice.

00:10:50.254 --> 00:10:51.634
and then you could break this up.

00:10:51.974 --> 00:10:53.734
So you could break this up and basically say

00:10:53.774 --> 00:10:55.984
instead of query you could like specify I only

00:10:55.984 --> 00:10:58.544
want data and I only want is loading and I only

00:10:58.544 --> 00:10:59.104
want error.

00:10:59.104 --> 00:11:00.904
Kind of like how we had in the first example.

00:11:01.264 --> 00:11:03.344
this is just kind of pseudo code but you handle it

00:11:03.344 --> 00:11:03.744
the same way.

00:11:03.744 --> 00:11:05.184
So you have a loading,

00:11:05.184 --> 00:11:07.064
you have a error handling and then you display

00:11:07.064 --> 00:11:07.678
your users.

00:11:09.454 --> 00:11:11.294
So now that we kind of understand why

00:11:11.634 --> 00:11:13.774
react query is really useful and we also

00:11:13.774 --> 00:11:15.614
understand the basics of like how you're going to

00:11:15.614 --> 00:11:16.894
use TRPC in your project.

00:11:17.454 --> 00:11:19.494
Let's head over to our code base and just kind of

00:11:19.494 --> 00:11:20.414
quickly walk through it.

00:11:20.414 --> 00:11:20.814
So

00:11:21.090 --> 00:11:22.610
what you're going to notice is our

00:11:22.720 --> 00:11:23.735
top countries table

00:11:23.735 --> 00:11:24.825
has the suspense query.

00:11:24.825 --> 00:11:26.265
It's very similar to use query.

00:11:26.265 --> 00:11:27.745
The only difference is it doesn't have a loading

00:11:27.745 --> 00:11:27.945
state.

00:11:27.945 --> 00:11:30.105
It just assumes that we have data and if we don't

00:11:30.105 --> 00:11:30.505
have the data,

00:11:30.505 --> 00:11:32.385
the component doesn't render up until we have that

00:11:32.385 --> 00:11:32.665
data.

00:11:33.145 --> 00:11:35.145
And then we basically say data is

00:11:35.295 --> 00:11:36.855
We're naming data clicks by country

00:11:37.445 --> 00:11:39.525
and then we're rendering that inside of a table.

00:11:39.925 --> 00:11:41.860
Now if you want to see the back end code,

00:11:43.240 --> 00:11:45.640
the back end code is actually part of this project

00:11:45.960 --> 00:11:47.440
so if you look out,

00:11:47.440 --> 00:11:48.760
if we look outside of here,

00:11:48.920 --> 00:11:51.040
we have source and then we have worker.

00:11:51.040 --> 00:11:53.280
The source is the front end application and the

00:11:53.280 --> 00:11:55.960
worker is the lightweight cloudflare worker.

00:11:55.960 --> 00:11:57.400
That's just kind of like the

00:11:57.540 --> 00:11:59.680
data interface for the front end of our

00:11:59.680 --> 00:12:00.200
application.

00:12:00.850 --> 00:12:04.490
We have this TRPC folder and this TRPC folder has

00:12:04.490 --> 00:12:05.410
our routers.

00:12:05.410 --> 00:12:07.410
So we can see here is we have this router,

00:12:07.410 --> 00:12:09.890
we have a links router and we have an evaluations

00:12:09.890 --> 00:12:10.450
router.

00:12:10.610 --> 00:12:11.810
The links router

00:12:12.130 --> 00:12:12.770
has these

00:12:12.800 --> 00:12:15.190
different methods that we've implemented and these

00:12:15.190 --> 00:12:16.070
are all type safe.

00:12:16.070 --> 00:12:16.990
So what we can do,

00:12:16.990 --> 00:12:17.790
and this is like,

00:12:17.790 --> 00:12:18.270
honestly,

00:12:18.270 --> 00:12:20.910
probably like the best part of trpc,

00:12:20.990 --> 00:12:22.670
other than it being type safe is

00:12:23.070 --> 00:12:25.590
if I'm so I'm here in my front end and then I want

00:12:25.590 --> 00:12:26.910
to go find the back end code

00:12:27.190 --> 00:12:27.990
that lives somewhere.

00:12:27.990 --> 00:12:29.310
Maybe if your project's huge,

00:12:29.310 --> 00:12:29.710
you're like,

00:12:29.710 --> 00:12:29.990
okay,

00:12:29.990 --> 00:12:30.710
I want to go find this,

00:12:30.710 --> 00:12:32.470
I could go search for the file and jump to it.

00:12:32.470 --> 00:12:35.970
But you could also command and click on the method

00:12:35.970 --> 00:12:38.335
and it jumps right to this back in code.

00:12:38.335 --> 00:12:39.895
So right now the backend code,

00:12:39.895 --> 00:12:41.935
all it's doing is it's saying I don't have any

00:12:41.935 --> 00:12:42.415
input,

00:12:42.415 --> 00:12:44.095
I just get the data for that account

00:12:44.655 --> 00:12:46.495
and then I am going to return

00:12:46.895 --> 00:12:47.295
a

00:12:47.382 --> 00:12:48.515
dummy data array

00:12:48.995 --> 00:12:50.195
of these countries.

00:12:50.515 --> 00:12:52.575
So it's basically like a country code and,

00:12:52.725 --> 00:12:53.685
and a count code.

00:12:53.765 --> 00:12:55.565
So that's kind of how we're interfacing with it.

00:12:55.565 --> 00:12:57.125
Now what we're going to do throughout the,

00:12:57.365 --> 00:12:59.525
the next few sections of this course is we're

00:12:59.525 --> 00:13:01.285
going to start building out the back end for this.

00:13:01.285 --> 00:13:02.245
So we're going to build out,

00:13:02.305 --> 00:13:04.065
we're going to create a database and we're going

00:13:04.065 --> 00:13:06.185
to create those tables and then throughout this

00:13:06.185 --> 00:13:08.225
course we're going to use different queries,

00:13:09.355 --> 00:13:11.555
that wire into these methods.

00:13:11.555 --> 00:13:13.515
So we'll have some like const data

00:13:13.915 --> 00:13:14.635
await

00:13:16.635 --> 00:13:17.035
my

00:13:17.355 --> 00:13:17.875
query.

00:13:17.875 --> 00:13:19.755
So it's going to call like a database on the back

00:13:19.755 --> 00:13:21.355
end and then it's going to return that data to the

00:13:21.355 --> 00:13:21.755
front end.

00:13:21.755 --> 00:13:23.355
So we're going to start building this out right

00:13:23.355 --> 00:13:23.475
now.

00:13:23.475 --> 00:13:25.255
But I just think really important to kind of just

00:13:25.255 --> 00:13:26.415
solidify that.

00:13:26.415 --> 00:13:30.295
We have a react application that's using Tanstack

00:13:30.315 --> 00:13:33.105
router for page navigation and then we're using

00:13:33.105 --> 00:13:35.945
Tanstack query to get data from a lightweight

00:13:35.945 --> 00:13:37.985
backend that's bundled in the exact same

00:13:38.125 --> 00:13:38.425
project.

00:13:38.425 --> 00:13:40.185
So in the exact same user application.

00:13:40.665 --> 00:13:43.625
And that backend is hosted on a cloudflare worker.

00:13:43.945 --> 00:13:45.665
And that cloudflare worker is,

00:13:45.665 --> 00:13:46.985
has implemented trpc.

00:13:46.985 --> 00:13:49.185
So we have really type safe data exchange from the

00:13:49.185 --> 00:13:50.185
front end to the back end.

00:13:50.465 --> 00:13:52.345
Honestly this is a simple setup but it's so

00:13:52.345 --> 00:13:55.025
stinking powerful and I do think like if you like

00:13:55.025 --> 00:13:55.345
Next,

00:13:56.125 --> 00:13:56.685
that's fine.

00:13:56.685 --> 00:13:57.325
Like we have like,

00:13:57.325 --> 00:13:59.085
like you can use TRPC with next.

00:13:59.165 --> 00:14:00.125
Next also has

00:14:00.155 --> 00:14:01.005
Next JS has

00:14:01.405 --> 00:14:03.925
their server functions as kind of like an offering

00:14:03.925 --> 00:14:05.135
which is very similar to this.

00:14:05.435 --> 00:14:07.435
but the beauty of this is like it's just framework

00:14:07.435 --> 00:14:07.995
agnostic.

00:14:07.995 --> 00:14:10.715
Bring it to any TSX based project and like

00:14:10.715 --> 00:14:12.235
everything becomes so much easier.

00:14:12.235 --> 00:14:13.995
So we're going to dive deeper into this.

00:14:14.075 --> 00:14:14.086
So.

00:14:14.086 --> 00:14:16.209
But now that we understand holistically the front

00:14:16.209 --> 00:14:19.249
end to the lightweight back end running onto trpc,

00:14:19.329 --> 00:14:21.209
let's get into like the data aspect of this

00:14:21.209 --> 00:14:21.450
course.

