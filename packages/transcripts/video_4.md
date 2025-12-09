WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:00.000 --> 00:00:00.124
Now,

00:00:00.124 --> 00:00:01.684
before we start actively building out this

00:00:01.684 --> 00:00:01.964
project,

00:00:01.964 --> 00:00:03.764
I think it's really important to understand some

00:00:03.764 --> 00:00:05.804
key concepts about the worker runtime.

00:00:05.884 --> 00:00:07.364
The worker runtime is very unique.

00:00:07.364 --> 00:00:09.164
If you're going to compare it to other compute

00:00:09.164 --> 00:00:09.764
platforms,

00:00:09.764 --> 00:00:12.404
the main reason is because it runs entirely on VA

00:00:12.404 --> 00:00:12.905
isolates.

00:00:13.819 --> 00:00:15.819
Vite ISOs were originally created by a team in

00:00:15.819 --> 00:00:17.939
Google with the goal of building a lightweight

00:00:17.939 --> 00:00:20.339
performant JavaScript runtime that allows them to

00:00:20.339 --> 00:00:22.859
isolate code to run in individual tabs on a

00:00:22.859 --> 00:00:23.339
browser.

00:00:23.419 --> 00:00:25.619
This helped them increase security and also made

00:00:25.619 --> 00:00:26.110
the browser a

00:00:26.110 --> 00:00:27.423
A much more performant application.

00:00:27.932 --> 00:00:28.052
Now,

00:00:28.052 --> 00:00:30.332
considering the v8 runtime was originally intended

00:00:30.332 --> 00:00:32.532
to help speed up the performance of a browser,

00:00:32.532 --> 00:00:33.612
you might be wondering,

00:00:33.852 --> 00:00:35.652
why would I actually want to run this on the

00:00:35.652 --> 00:00:36.092
server?

00:00:36.252 --> 00:00:37.612
And in order to understand this,

00:00:37.612 --> 00:00:39.652
we kind of have to take a step back and look at

00:00:39.652 --> 00:00:41.412
how web applications have been deployed really

00:00:41.412 --> 00:00:42.422
since the beginning of the Internet.

00:00:43.242 --> 00:00:45.322
Now traditionally software engineers would build

00:00:45.322 --> 00:00:47.162
their application and they would deploy it to a

00:00:47.162 --> 00:00:47.802
single server.

00:00:47.802 --> 00:00:49.482
And this single server would be,

00:00:49.482 --> 00:00:51.762
that would be running some type of HTTP handler

00:00:51.762 --> 00:00:53.722
and then it would receive requests from the

00:00:53.722 --> 00:00:54.082
Internet.

00:00:54.082 --> 00:00:55.402
That's what this little guy is right here.

00:00:55.812 --> 00:00:56.862
it would take that request,

00:00:56.862 --> 00:00:57.502
it would process,

00:00:57.502 --> 00:00:59.062
it would respond to the user.

00:00:59.142 --> 00:00:59.542
And

00:00:59.932 --> 00:01:01.822
then if you wanted to handle lots and lots and

00:01:01.822 --> 00:01:02.542
lots of requests,

00:01:02.542 --> 00:01:04.262
you would have a beefier server,

00:01:04.262 --> 00:01:05.222
you'd have more cores,

00:01:05.222 --> 00:01:07.342
you would be able to handle more processing at the

00:01:07.342 --> 00:01:08.062
exact same time.

00:01:08.592 --> 00:01:09.272
and this model,

00:01:09.272 --> 00:01:09.592
you know,

00:01:09.592 --> 00:01:10.752
it works to a certain extent,

00:01:10.752 --> 00:01:13.192
but eventually you either get too many requests

00:01:13.192 --> 00:01:14.312
that might overwhelm the server.

00:01:14.312 --> 00:01:15.662
If like you have a ton of users,

00:01:15.762 --> 00:01:16.522
or you know,

00:01:16.522 --> 00:01:18.482
maybe you have a server issue or a network issue,

00:01:18.482 --> 00:01:20.042
or there's something at the data center that,

00:01:20.042 --> 00:01:21.442
where the server is deployed at,

00:01:21.442 --> 00:01:22.082
where there's,

00:01:22.082 --> 00:01:22.722
there's a problem.

00:01:22.882 --> 00:01:25.642
And then during that period of time your server is

00:01:25.642 --> 00:01:28.042
not able to respond to requests and it has

00:01:28.042 --> 00:01:28.642
downtime.

00:01:28.642 --> 00:01:29.042
So

00:01:29.362 --> 00:01:31.642
a very common pattern which essentially all

00:01:31.642 --> 00:01:33.922
production ready applications are following is

00:01:33.922 --> 00:01:34.322
they

00:01:35.032 --> 00:01:36.952
deploy their service to multiple servers

00:01:37.352 --> 00:01:39.112
that act as a distributed system.

00:01:39.112 --> 00:01:40.792
And in the middle or right before,

00:01:41.552 --> 00:01:42.272
those requests,

00:01:42.272 --> 00:01:44.392
there's another service called a load balancer or

00:01:44.392 --> 00:01:45.072
a proxy.

00:01:45.152 --> 00:01:47.592
And essentially it receives these requests and

00:01:47.592 --> 00:01:48.452
then it routes it,

00:01:48.612 --> 00:01:50.852
usually in a smart way to like the nearest server

00:01:50.852 --> 00:01:51.532
from the user.

00:01:51.532 --> 00:01:52.772
And then if this,

00:01:52.772 --> 00:01:53.132
you know,

00:01:53.132 --> 00:01:54.692
server server number three goes down,

00:01:55.012 --> 00:01:57.012
the load balancer is able to detect that pretty

00:01:57.012 --> 00:01:58.932
early on and it's able to route those requests to

00:01:58.932 --> 00:01:59.652
other servers.

00:01:59.652 --> 00:02:01.292
Now this model works really,

00:02:01.292 --> 00:02:01.692
really well.

00:02:01.692 --> 00:02:02.322
You can be built,

00:02:02.392 --> 00:02:02.712
build very,

00:02:02.712 --> 00:02:04.472
very scalable web applications.

00:02:04.632 --> 00:02:05.772
but the downside is,

00:02:05.772 --> 00:02:07.252
is it can be really expensive,

00:02:07.652 --> 00:02:09.332
especially if you don't have a ton of traffic.

00:02:09.332 --> 00:02:09.572
You know,

00:02:09.572 --> 00:02:10.532
if you're not handling

00:02:11.012 --> 00:02:12.892
hundreds of millions of requests every single

00:02:12.892 --> 00:02:13.172
month,

00:02:13.172 --> 00:02:14.492
you might really like this.

00:02:14.492 --> 00:02:16.332
This model might not make a whole lot of sense

00:02:16.332 --> 00:02:18.332
because you're paying so much for every single

00:02:18.332 --> 00:02:19.932
server to be running all the time.

00:02:19.932 --> 00:02:20.292
And

00:02:20.572 --> 00:02:21.072
for your,

00:02:21.392 --> 00:02:22.952
for your service to be considered actually

00:02:22.952 --> 00:02:24.152
resilient production ready,

00:02:24.152 --> 00:02:26.192
you probably need at least three servers.

00:02:26.192 --> 00:02:27.332
even if you don't even,

00:02:27.332 --> 00:02:28.772
you don't necessarily need to hand.

00:02:29.012 --> 00:02:30.372
Even if you don't have enough traffic

00:02:30.652 --> 00:02:32.652
to warrant those three servers for your

00:02:32.652 --> 00:02:34.252
application to be considered production ready,

00:02:34.252 --> 00:02:35.212
that's kind of required.

00:02:35.868 --> 00:02:38.028
so that's where this concept of serverless compute

00:02:38.028 --> 00:02:38.468
comes in.

00:02:38.468 --> 00:02:38.868
You know,

00:02:38.868 --> 00:02:42.108
serverless compute isn't necessarily a compute

00:02:42.108 --> 00:02:42.748
without a server,

00:02:42.748 --> 00:02:44.668
because obviously you need a server to handle

00:02:44.668 --> 00:02:45.708
requests and to actually

00:02:46.188 --> 00:02:47.508
deploy and run your code.

00:02:47.508 --> 00:02:49.428
But essentially what they did is they said,

00:02:49.428 --> 00:02:52.148
and I think this was made popular by AWS Lambda,

00:02:52.148 --> 00:02:53.708
but I don't think they were the first provider of

00:02:53.708 --> 00:02:54.668
serverless compute.

00:02:54.908 --> 00:02:56.068
But essentially what they said is,

00:02:56.068 --> 00:02:58.828
what if we took the logic of receiving these

00:02:58.828 --> 00:03:01.108
requests from the Internet or from some service,

00:03:01.108 --> 00:03:01.697
and then

00:03:01.931 --> 00:03:04.211
what if we built out a layer of being able to

00:03:04.211 --> 00:03:04.731
determine

00:03:05.051 --> 00:03:07.131
when we should take code and when we should turn

00:03:07.131 --> 00:03:09.371
servers on and when we should execute requests.

00:03:09.451 --> 00:03:11.291
So essentially they built this serverless

00:03:11.291 --> 00:03:13.131
scheduler and then what they would do is their

00:03:13.131 --> 00:03:15.451
service would receive a request and based upon

00:03:15.451 --> 00:03:15.771
the,

00:03:16.090 --> 00:03:17.771
based upon the URL or the,

00:03:17.771 --> 00:03:19.691
the host that was trying to access it,

00:03:19.771 --> 00:03:21.291
it would know where it should route to.

00:03:21.291 --> 00:03:23.371
So it would know that it needs to go to your,

00:03:23.611 --> 00:03:25.691
needs to take your code and it needs to put it on

00:03:25.691 --> 00:03:27.131
a server and needs to execute,

00:03:27.531 --> 00:03:28.131
the request.

00:03:28.131 --> 00:03:30.451
And then once it's no longer receiving requests,

00:03:30.451 --> 00:03:31.371
the server can bas

00:03:31.671 --> 00:03:31.991
go away,

00:03:31.991 --> 00:03:33.351
and then you're not going to be billed for that

00:03:33.351 --> 00:03:34.991
time when you're not getting any requests.

00:03:34.991 --> 00:03:35.351
So

00:03:35.751 --> 00:03:37.591
essentially they were able to build a scheduling

00:03:37.591 --> 00:03:38.071
like a.

00:03:38.311 --> 00:03:40.031
So essentially they were able to build a layer

00:03:40.031 --> 00:03:42.231
that could orchestrate the management of servers

00:03:42.551 --> 00:03:43.911
at a request basis,

00:03:44.471 --> 00:03:46.671
which makes it so you don't need to follow this

00:03:46.671 --> 00:03:48.371
model of always having these servers on.

00:03:48.371 --> 00:03:49.891
there was some considerations here.

00:03:49.891 --> 00:03:50.131
You,

00:03:50.131 --> 00:03:51.771
you took a performance hit because this is,

00:03:51.771 --> 00:03:52.691
in my opinion,

00:03:52.851 --> 00:03:55.131
the most performant way to run an application is

00:03:55.131 --> 00:03:56.371
to have servers always on,

00:03:56.371 --> 00:03:57.371
close to the user,

00:03:57.371 --> 00:03:58.571
ready to receive a request.

00:03:58.571 --> 00:04:00.251
I don't think serverless is ever going to

00:04:00.251 --> 00:04:02.131
necessarily beat this model,

00:04:02.131 --> 00:04:04.671
but in terms of price and efficiency,

00:04:05.391 --> 00:04:07.911
the serverless route worked for a lot of

00:04:07.911 --> 00:04:08.511
applications.

00:04:08.551 --> 00:04:10.751
because the complexity of managing where the

00:04:10.751 --> 00:04:13.151
requests go and when servers should be turned on

00:04:13.151 --> 00:04:14.791
was taken care of by the provider.

00:04:15.111 --> 00:04:15.911
In this example,

00:04:15.911 --> 00:04:16.969
AWS Lambda.

00:04:17.965 --> 00:04:20.885
Now behind the scenes AWS Lambda is doing a lot of

00:04:20.885 --> 00:04:21.565
different things.

00:04:21.885 --> 00:04:24.525
You are going to write your code and you're going

00:04:24.525 --> 00:04:27.045
to handle requests based upon the code that you

00:04:27.045 --> 00:04:27.565
define.

00:04:27.805 --> 00:04:30.285
But in order for a request to make it to your

00:04:30.285 --> 00:04:30.525
code,

00:04:30.525 --> 00:04:32.645
there's a whole bunch of stuff that goes on in the

00:04:32.645 --> 00:04:33.285
serverless world.

00:04:33.285 --> 00:04:34.125
And this is going to be,

00:04:34.125 --> 00:04:35.245
this is applicable to

00:04:36.025 --> 00:04:37.305
the worker runtime,

00:04:37.305 --> 00:04:39.305
this is applicable to aws,

00:04:39.305 --> 00:04:41.825
this is also applicable to Netlify and Vercel.

00:04:41.825 --> 00:04:43.305
And really anywhere you're going to ship to

00:04:43.305 --> 00:04:44.425
serverless Compute,

00:04:44.745 --> 00:04:45.535
essentially you have,

00:04:45.685 --> 00:04:48.165
have under AWS Lambda there's a series of steps

00:04:48.165 --> 00:04:48.485
that happen.

00:04:48.485 --> 00:04:49.845
If it receives a request

00:04:50.325 --> 00:04:51.285
for the very first time,

00:04:51.285 --> 00:04:53.485
you have some request routing logic that

00:04:53.485 --> 00:04:53.925
determines,

00:04:53.925 --> 00:04:54.365
you know,

00:04:54.365 --> 00:04:54.725
like

00:04:55.455 --> 00:04:56.735
where that request should go,

00:04:56.895 --> 00:04:57.455
what region,

00:04:57.455 --> 00:04:58.385
what data center.

00:04:58.385 --> 00:05:00.455
then you have a Lambda scheduler that's going to

00:05:00.614 --> 00:05:03.295
determine if it needs to provision servers for

00:05:03.295 --> 00:05:04.535
that specific requests.

00:05:04.545 --> 00:05:07.365
it can determine if there's going if your code is

00:05:07.365 --> 00:05:09.365
already warm or if your code has already been

00:05:09.365 --> 00:05:11.445
loaded and is actively on a server right now,

00:05:11.445 --> 00:05:13.885
or if it has to go provision a new server for you.

00:05:13.885 --> 00:05:16.275
So there's this layer of basically server managed

00:05:16.745 --> 00:05:17.825
at the request layer.

00:05:17.825 --> 00:05:19.465
And this can actually take quite some time.

00:05:19.465 --> 00:05:20.665
If you look online,

00:05:20.665 --> 00:05:22.385
their docs say cold start.

00:05:22.385 --> 00:05:24.345
So like the slowest that you would expect would be

00:05:24.585 --> 00:05:27.145
50 to 150 milliseconds for that to start up.

00:05:27.175 --> 00:05:28.625
and then you have the runtime boot.

00:05:28.625 --> 00:05:30.545
So because this is actually like running a

00:05:30.545 --> 00:05:31.065
traditional

00:05:31.135 --> 00:05:33.745
is running on a runtime that's more akin to an

00:05:33.745 --> 00:05:34.825
actual beefy server.

00:05:34.825 --> 00:05:35.847
Like what we see over here,

00:05:35.847 --> 00:05:37.195
what happens is that

00:05:38.075 --> 00:05:40.115
runtime or that environment has to get ready and

00:05:40.115 --> 00:05:41.995
it's like a very lightweight version of what you'd

00:05:41.995 --> 00:05:43.515
be running on one of these servers.

00:05:44.125 --> 00:05:46.085
But it still takes quite some time to spin up.

00:05:46.085 --> 00:05:48.045
So you have to instantiate the environment.

00:05:48.465 --> 00:05:50.485
you have to load all of your environment variables

00:05:50.485 --> 00:05:51.165
and it has to be,

00:05:51.165 --> 00:05:53.245
your code has to basically the environment has to

00:05:53.245 --> 00:05:55.325
be in a state that's ready for your code to run.

00:05:55.485 --> 00:05:56.525
This process can take

00:05:57.085 --> 00:05:58.288
20 to 80 milliseconds.

00:05:58.468 --> 00:05:59.828
and then once that's done,

00:06:00.308 --> 00:06:02.228
Lambda is going to have to basically go say okay,

00:06:02.228 --> 00:06:04.428
like where we need to get their code and we have

00:06:04.428 --> 00:06:06.748
to put it in this environment so we can run it.

00:06:06.748 --> 00:06:08.668
So typically what it's going to do is it's going

00:06:08.668 --> 00:06:10.468
to pull that code from S3.

00:06:10.668 --> 00:06:11.808
I think that's how Lambda does it.

00:06:11.808 --> 00:06:14.448
And then they bring it in into memory and it gets

00:06:14.448 --> 00:06:17.528
instantiated and then once that process is done

00:06:17.768 --> 00:06:20.048
now your code is ready to be invoked so the

00:06:20.048 --> 00:06:22.728
handler that you define to process that request is

00:06:22.728 --> 00:06:23.848
finally invoked.

00:06:24.168 --> 00:06:24.998
Now this is

00:06:24.998 --> 00:06:26.338
the worst case scenario because,

00:06:26.338 --> 00:06:28.128
this step is going to take quite some time.

00:06:28.368 --> 00:06:30.128
This step is going to take quite some time.

00:06:30.368 --> 00:06:32.288
This step is going to take quite some time.

00:06:32.368 --> 00:06:34.048
And then you finally handle,

00:06:34.628 --> 00:06:36.708
the actual request that comes in.

00:06:37.108 --> 00:06:37.508
Now,

00:06:37.538 --> 00:06:39.528
in a scenario where you just got a request and

00:06:39.528 --> 00:06:41.528
then another request is made and this process has

00:06:41.528 --> 00:06:42.328
already been done,

00:06:42.358 --> 00:06:43.708
the router is basically going to say,

00:06:43.708 --> 00:06:44.148
okay,

00:06:44.148 --> 00:06:46.908
let's just go pass that request off to the handler

00:06:46.908 --> 00:06:47.988
and then it's going to be pretty quick.

00:06:47.988 --> 00:06:49.828
But cold starts have been a problem and companies

00:06:49.828 --> 00:06:52.468
like Vercel have innovated a lot on top of AWS

00:06:52.468 --> 00:06:54.908
Lambda to help with the performance and also price

00:06:54.908 --> 00:06:55.228
control.

00:06:55.228 --> 00:06:55.506
Here.

00:06:56.258 --> 00:06:58.098
Now when you run your code on Cloudflare workers,

00:06:58.178 --> 00:07:00.338
there's a very similar flow that happens before

00:07:00.338 --> 00:07:01.538
your code is executed.

00:07:01.538 --> 00:07:03.778
It's just considerably more efficient and really,

00:07:03.778 --> 00:07:04.458
really snappy.

00:07:04.458 --> 00:07:06.178
So we can kind of go through that process right

00:07:06.178 --> 00:07:06.418
now.

00:07:06.418 --> 00:07:08.578
So essentially there's a request routing layer

00:07:08.738 --> 00:07:11.218
which determines where that request should go.

00:07:11.408 --> 00:07:14.388
and then there's an isolate selections or creation

00:07:14.388 --> 00:07:14.828
layer.

00:07:14.828 --> 00:07:16.948
So essentially what happens here is the worker

00:07:16.948 --> 00:07:17.588
runtime says,

00:07:17.588 --> 00:07:17.988
hey,

00:07:18.258 --> 00:07:19.138
I got this request.

00:07:19.138 --> 00:07:21.458
I want to go see if the code that's supposed to

00:07:21.458 --> 00:07:24.218
run this request is already living on some isolate

00:07:24.218 --> 00:07:25.218
out there that I can use.

00:07:25.378 --> 00:07:26.378
And if it's not there,

00:07:26.378 --> 00:07:27.978
it's going to go create that isolate.

00:07:27.978 --> 00:07:31.178
Now this isolate creation step is very similar to

00:07:31.178 --> 00:07:32.738
what you're going to see here during the lambda

00:07:32.738 --> 00:07:33.998
scheduler in the bootstrap,

00:07:33.998 --> 00:07:34.318
the run,

00:07:34.318 --> 00:07:36.878
the runtime bootstrap from AWS Lambda.

00:07:36.958 --> 00:07:39.238
But the only difference is the way that it's

00:07:39.238 --> 00:07:41.358
designed is it's incredibly snappy because it's

00:07:41.358 --> 00:07:43.078
very similar to a browser where it's able to get

00:07:43.078 --> 00:07:44.838
that code and just get it instantiated running

00:07:44.838 --> 00:07:45.038
really,

00:07:45.038 --> 00:07:45.598
really quickly.

00:07:45.598 --> 00:07:47.158
So the creation process,

00:07:47.158 --> 00:07:48.558
if you look on Cloudflare's docs,

00:07:48.558 --> 00:07:49.438
they say it takes about

00:07:49.898 --> 00:07:51.018
milliseconds for that to happen,

00:07:51.018 --> 00:07:52.298
which is insanely fast.

00:07:52.298 --> 00:07:54.058
It's not going to be noticeable by the user.

00:07:54.058 --> 00:07:54.288
And

00:07:54.288 --> 00:07:56.278
when they say virtually no cold starts with a

00:07:56.278 --> 00:07:58.438
caveat of 5 milliseconds when there is a cold

00:07:58.438 --> 00:07:58.638
start.

00:07:58.638 --> 00:07:59.318
That's what they mean.

00:07:59.318 --> 00:07:59.758
Like it's,

00:07:59.758 --> 00:08:00.638
it's very snappy.

00:08:01.548 --> 00:08:02.308
and you know,

00:08:02.308 --> 00:08:03.908
if there is an isolate already running,

00:08:03.908 --> 00:08:06.028
it selects that and then you kind of bypass that

00:08:06.028 --> 00:08:06.828
creation process.

00:08:07.338 --> 00:08:08.938
and then the step right before

00:08:09.258 --> 00:08:10.618
your code runs is

00:08:10.938 --> 00:08:12.218
the request object

00:08:12.698 --> 00:08:13.338
construction.

00:08:13.338 --> 00:08:16.098
So essentially Cloudflare has to get the data that

00:08:16.098 --> 00:08:18.058
is sent in a format and in a,

00:08:18.058 --> 00:08:18.538
in a

00:08:18.998 --> 00:08:21.678
standard request format that is understandable by

00:08:21.678 --> 00:08:22.238
your worker.

00:08:22.238 --> 00:08:24.518
And then that's kind of what you receive inside of

00:08:24.518 --> 00:08:26.638
your worker code when you're building and you're

00:08:26.638 --> 00:08:26.828
actually

00:08:26.888 --> 00:08:28.478
building on top of the worker runtime.

00:08:28.478 --> 00:08:31.398
So it gets that object ready and then it passes it

00:08:31.398 --> 00:08:33.918
to your worker which contains your business logic,

00:08:33.918 --> 00:08:34.998
your application code,

00:08:34.998 --> 00:08:36.038
and then it executes.

00:08:36.038 --> 00:08:37.438
So the flow is very similar.

00:08:37.438 --> 00:08:38.958
It's just so much faster,

00:08:39.008 --> 00:08:39.798
in terms of

00:08:40.198 --> 00:08:41.678
performance and efficiency.

00:08:41.678 --> 00:08:43.678
And it's much cheaper to run this type of

00:08:43.678 --> 00:08:45.358
environment because you're not running like a

00:08:45.358 --> 00:08:45.598
really,

00:08:45.598 --> 00:08:46.358
really fat,

00:08:47.268 --> 00:08:49.878
node based image or a Firecra record based

00:08:50.538 --> 00:08:50.915
vm.

00:08:51.058 --> 00:08:52.936
You're running a runtime that's very lightweight.

00:08:52.936 --> 00:08:54.086
there's some limitations there,

00:08:54.086 --> 00:08:56.286
but it's also really fast to build on top of

00:08:56.360 --> 00:08:58.386
Now there's also pricing considerations when

00:08:58.386 --> 00:09:00.986
you're going to deploy onto a serverless runtime.

00:09:00.986 --> 00:09:02.426
And this is where I think Cloudflare really,

00:09:02.426 --> 00:09:02.986
really shines.

00:09:02.986 --> 00:09:05.306
They made a bet early on that has really worked

00:09:05.306 --> 00:09:06.906
out for them and we'll kind of go over why.

00:09:07.066 --> 00:09:09.226
So if we look at AWS Lambda,

00:09:09.226 --> 00:09:10.546
you're going to be billed for the number of

00:09:10.546 --> 00:09:13.666
requests that you receive plus the amount of time

00:09:13.666 --> 00:09:14.426
that your code

00:09:14.906 --> 00:09:15.786
spent running.

00:09:15.946 --> 00:09:17.466
So an example of this is going to be,

00:09:17.466 --> 00:09:20.066
let's say your service or your handler gets a

00:09:20.066 --> 00:09:20.506
request

00:09:20.986 --> 00:09:23.466
and from the time it gets a request to the time it

00:09:23.466 --> 00:09:24.266
fulfills that requ

00:09:24.566 --> 00:09:26.726
it takes one second or 100 milliseconds.

00:09:27.176 --> 00:09:28.886
let's say during that time your,

00:09:28.886 --> 00:09:31.126
your code processes the request and it reaches out

00:09:31.126 --> 00:09:33.006
to OpenAI to do some,

00:09:33.086 --> 00:09:34.606
to do some text generation.

00:09:35.086 --> 00:09:37.486
That text generation takes 800 milliseconds to

00:09:37.486 --> 00:09:37.966
resolve.

00:09:37.966 --> 00:09:39.566
Then your server gets the response,

00:09:39.856 --> 00:09:41.736
does a little bit more processing and then it

00:09:41.736 --> 00:09:43.816
returns the response back to the user.

00:09:43.816 --> 00:09:45.896
So this entire operation takes

00:09:46.216 --> 00:09:47.976
1 second or 100 milliseconds.

00:09:48.056 --> 00:09:50.136
Your build for the entire duration

00:09:50.496 --> 00:09:51.216
of this request.

00:09:51.796 --> 00:09:52.916
now there's,

00:09:52.916 --> 00:09:54.996
there's some companies like Vercel,

00:09:54.996 --> 00:09:56.796
they've recently come out with solutions where

00:09:56.796 --> 00:09:59.876
they're able to do some type of like compute based

00:10:00.036 --> 00:10:02.196
billing instead of like entire duration based

00:10:02.196 --> 00:10:02.676
billing.

00:10:02.916 --> 00:10:04.836
And I'm not entirely sure what they're doing

00:10:04.836 --> 00:10:06.276
behind the scenes to make that happen.

00:10:06.356 --> 00:10:08.556
But if you're just looking at AWS Lambda,

00:10:08.556 --> 00:10:10.996
this is the typical like pricing model and then a

00:10:10.996 --> 00:10:13.196
lot of other providers that have built on top of

00:10:13.196 --> 00:10:14.116
AWS Lambda,

00:10:14.116 --> 00:10:15.916
now this actually might change in the next few

00:10:15.916 --> 00:10:16.596
years because

00:10:16.916 --> 00:10:19.436
so many applications are spending 15 seconds

00:10:19.436 --> 00:10:21.556
waiting for a AI prompt,

00:10:21.776 --> 00:10:24.336
an AI generation to resolve and it's just like

00:10:24.336 --> 00:10:25.496
ballooning prices.

00:10:25.496 --> 00:10:27.296
So this is something that I feel like in the

00:10:27.296 --> 00:10:28.616
serverless world has to change.

00:10:28.616 --> 00:10:29.336
But you know,

00:10:29.336 --> 00:10:31.096
five years ago when Cloudflare came out with the

00:10:31.096 --> 00:10:33.096
workers and they had their pricing model they kind

00:10:33.096 --> 00:10:35.296
of designed for AI before AI was a big deal.

00:10:35.836 --> 00:10:37.715
and the reason why is like let's take that same

00:10:37.715 --> 00:10:38.746
request that's going to take

00:10:38.806 --> 00:10:41.156
1000 milliseconds or 1 second to fulfill.

00:10:41.316 --> 00:10:43.756
And then 800 milliseconds is just waiting for an

00:10:43.756 --> 00:10:44.756
API to respond.

00:10:44.916 --> 00:10:47.636
You're only billed for the active CPU time.

00:10:47.716 --> 00:10:48.376
So you,

00:10:48.446 --> 00:10:49.886
any IO related operation,

00:10:49.886 --> 00:10:51.126
reaching out to a database,

00:10:51.126 --> 00:10:52.926
reaching out to an API provider,

00:10:53.016 --> 00:10:55.833
sticking data in storage or R2 or object storage,

00:10:55.833 --> 00:10:58.482
really any operation that isn't just running

00:10:58.482 --> 00:10:59.922
actual code on that server,

00:10:59.922 --> 00:11:03.042
like crunching data on the CPU you're not built

00:11:03.042 --> 00:11:03.322
for.

00:11:03.322 --> 00:11:06.442
So typically a request like that takes one second

00:11:06.442 --> 00:11:07.122
to fulfill,

00:11:07.122 --> 00:11:08.962
especially if it's just reaching out to APIs and

00:11:08.962 --> 00:11:09.562
databases.

00:11:09.722 --> 00:11:10.162
You see,

00:11:10.162 --> 00:11:12.472
it's like 8 milliseconds or 9 milliseconds in

00:11:12.472 --> 00:11:14.072
compute time and you're only billed for that.

00:11:14.072 --> 00:11:15.232
So you're built for the request,

00:11:15.232 --> 00:11:17.472
which is way cheaper than any other serverless

00:11:18.532 --> 00:11:19.172
that I've seen.

00:11:19.172 --> 00:11:20.932
And then you're only billed for the CPU time,

00:11:20.932 --> 00:11:21.572
which is crazy.

00:11:21.572 --> 00:11:22.572
So like the pricing,

00:11:22.572 --> 00:11:24.492
you're able to really control pricing with this

00:11:24.492 --> 00:11:24.892
model.

00:11:24.892 --> 00:11:26.132
Especially in a world where

00:11:26.451 --> 00:11:28.172
so much of what we do is just integrating with

00:11:28.172 --> 00:11:30.070
other services and we need just a lightweight.

00:11:30.070 --> 00:11:31.867
We need a lightweight application that is just

00:11:31.867 --> 00:11:33.267
going to kind of get a request,

00:11:33.347 --> 00:11:34.707
go reach out to a database,

00:11:34.707 --> 00:11:36.227
stick some data in R2,

00:11:36.227 --> 00:11:36.787
pull some,

00:11:36.787 --> 00:11:38.867
pull an image from Object Storage.

00:11:38.867 --> 00:11:40.787
Just these typical operations that we're doing

00:11:41.307 --> 00:11:43.587
within our code is just so cheap to do on

00:11:43.587 --> 00:11:44.187
cloudflare.

