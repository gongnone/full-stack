WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.178 --> 00:00:02.538
So now that we fully completed this link routing

00:00:02.538 --> 00:00:02.938
logic,

00:00:02.938 --> 00:00:05.178
which is kind of like the crux of the product

00:00:05.178 --> 00:00:05.778
offering,

00:00:06.338 --> 00:00:07.938
we're going to get into what my,

00:00:07.938 --> 00:00:08.698
in my opinion,

00:00:08.698 --> 00:00:10.498
the funnest aspect of this course.

00:00:10.818 --> 00:00:13.578
So we're going to dive deeper into the data side

00:00:13.578 --> 00:00:14.018
of things,

00:00:14.348 --> 00:00:15.538
building out Cloudflare services.

00:00:16.178 --> 00:00:17.418
Now as you can see here,

00:00:17.418 --> 00:00:19.538
there's like different features in this dashboard.

00:00:19.698 --> 00:00:22.098
A lot of this is providing us analytics

00:00:22.728 --> 00:00:22.968
and

00:00:23.468 --> 00:00:24.468
there's some different components.

00:00:24.468 --> 00:00:26.548
Like you have this map and in real time,

00:00:26.548 --> 00:00:27.508
when users are

00:00:28.068 --> 00:00:29.548
clicking on links and being routed to

00:00:29.548 --> 00:00:30.108
destinations,

00:00:30.108 --> 00:00:31.508
you should be able to see where those

00:00:32.008 --> 00:00:32.448
links are.

00:00:32.448 --> 00:00:34.368
And then we're going to be getting into different

00:00:34.528 --> 00:00:36.768
things about having AI check

00:00:38.148 --> 00:00:40.668
the health of a link destination to see if a

00:00:40.668 --> 00:00:42.548
product sold out or if the link isn't working

00:00:42.548 --> 00:00:43.508
anymore or whatnot.

00:00:43.938 --> 00:00:45.748
and we have a whole bunch of different features to

00:00:45.748 --> 00:00:46.748
build on top of that.

00:00:46.908 --> 00:00:47.308
Now

00:00:47.868 --> 00:00:50.868
in order to do so it all depends on a link being

00:00:50.868 --> 00:00:53.908
clicked and us capturing that data of a link being

00:00:53.908 --> 00:00:54.428
clicked.

00:00:54.748 --> 00:00:57.188
Now as you can see here inside of our app,

00:00:57.188 --> 00:00:58.668
ts like this is a pretty,

00:00:58.878 --> 00:01:00.048
this is a pretty like tight,

00:01:00.048 --> 00:01:02.968
a pretty safe route that we built out and there's

00:01:02.968 --> 00:01:05.488
really not like a lot of errors to like a lot of

00:01:05.488 --> 00:01:06.288
areas to fail.

00:01:07.168 --> 00:01:09.848
so what we could do is like when a user clicks on

00:01:09.848 --> 00:01:10.288
a link,

00:01:10.288 --> 00:01:11.648
we could have a

00:01:11.958 --> 00:01:14.518
database call where we like insert that data and

00:01:14.518 --> 00:01:15.478
then on the back,

00:01:15.868 --> 00:01:16.748
in the back end we could,

00:01:16.748 --> 00:01:17.148
you know,

00:01:17.148 --> 00:01:19.588
every like 10 minutes we can get some data and we

00:01:19.588 --> 00:01:19.948
can,

00:01:20.028 --> 00:01:20.548
you know,

00:01:20.548 --> 00:01:21.468
crunch the numbers,

00:01:21.468 --> 00:01:23.948
create the analytics and feed that into our

00:01:23.948 --> 00:01:24.428
dashboard.

00:01:24.428 --> 00:01:27.468
But if we want stuff to be real time and to be a

00:01:27.468 --> 00:01:29.708
little bit more reactive kind of event based,

00:01:29.868 --> 00:01:31.788
not just like batch processing based

00:01:32.588 --> 00:01:32.628
essentially,

00:01:33.008 --> 00:01:34.488
what we're going to want to do is we're going to

00:01:34.488 --> 00:01:35.008
want to

00:01:35.328 --> 00:01:36.368
introduce queues.

00:01:36.528 --> 00:01:38.288
And the reason why we're going to introduce queues

00:01:38.288 --> 00:01:40.848
is what we're going to say is when we get a

00:01:41.088 --> 00:01:41.648
request

00:01:42.368 --> 00:01:43.888
and we're going to route that to

00:01:44.448 --> 00:01:45.268
a destination.

00:01:45.517 --> 00:01:47.998
After that is done in the background of that

00:01:47.998 --> 00:01:48.518
request,

00:01:48.518 --> 00:01:50.118
we're just going to save a little bit of that

00:01:50.118 --> 00:01:50.438
information.

00:01:50.678 --> 00:01:51.718
We're going to say like,

00:01:52.038 --> 00:01:53.078
here's a link id,

00:01:53.398 --> 00:01:55.918
the user came from a country and this is like the

00:01:55.918 --> 00:01:56.318
latitude,

00:01:56.318 --> 00:01:58.078
the longitude and the

00:01:58.928 --> 00:02:01.408
and the destination that like they were routed to,

00:02:01.488 --> 00:02:03.488
we're going to send that to a queue and it's going

00:02:03.488 --> 00:02:04.968
to go to a queue and then it's going to be

00:02:04.968 --> 00:02:07.368
processed by a whole different service that's kind

00:02:07.368 --> 00:02:09.888
of isolated from this API that we've built out,

00:02:10.288 --> 00:02:12.908
and from there we can start building out really

00:02:12.908 --> 00:02:15.388
cool things like storing the data for analytics

00:02:15.388 --> 00:02:16.028
purposes.

00:02:16.508 --> 00:02:19.668
We can use durable objects to say,

00:02:19.668 --> 00:02:20.068
okay,

00:02:20.068 --> 00:02:21.268
this link was just clicked.

00:02:21.268 --> 00:02:23.068
We could send that data to a durable object.

00:02:23.068 --> 00:02:24.108
And if a user

00:02:24.428 --> 00:02:25.348
is on,

00:02:25.348 --> 00:02:25.628
like,

00:02:25.628 --> 00:02:25.948
their,

00:02:26.338 --> 00:02:27.298
web application,

00:02:27.378 --> 00:02:29.498
this web application could be connected to that

00:02:29.498 --> 00:02:31.338
durable object and then we'll be able to see that

00:02:31.338 --> 00:02:32.258
in real time here.

00:02:32.298 --> 00:02:35.328
we can also use these link clicks whenever a day,

00:02:35.328 --> 00:02:37.208
whenever data is written to a queue and we are

00:02:37.208 --> 00:02:38.608
able to process data from that queue.

00:02:38.608 --> 00:02:40.928
We could start running Cloudflare workflows to run

00:02:41.488 --> 00:02:43.888
our AI pipeline to determine the health of the

00:02:43.888 --> 00:02:44.088
link.

00:02:44.088 --> 00:02:44.248
So,

00:02:44.248 --> 00:02:44.448
like,

00:02:44.448 --> 00:02:46.728
everything is kind of going to be built on top of

00:02:46.728 --> 00:02:48.248
the fact that we are able to say,

00:02:48.248 --> 00:02:48.528
okay,

00:02:48.528 --> 00:02:49.488
a link is clicked,

00:02:49.648 --> 00:02:51.328
send that event to a queue,

00:02:51.408 --> 00:02:53.608
and then go trigger all of that orchestration,

00:02:53.608 --> 00:02:55.088
all that logic on the back end.

00:02:55.228 --> 00:02:56.188
we can trigger that

00:02:56.828 --> 00:02:58.908
based upon the data that's being fed from a queue.

00:02:58.908 --> 00:03:00.948
And we're going to go super deep into queues and

00:03:00.948 --> 00:03:01.908
other things in other,

00:03:01.908 --> 00:03:02.268
like,

00:03:02.788 --> 00:03:03.988
compute products that,

00:03:03.988 --> 00:03:06.028
that work that exist within Cloudflare's

00:03:06.028 --> 00:03:06.708
ecosystem.

00:03:06.868 --> 00:03:07.688
So let's get into it.

