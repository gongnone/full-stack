WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000

00:00:01.064 --> 00:00:03.744
Now the very next step of this workflow is going

00:00:03.744 --> 00:00:06.384
to be taking this collected data and then passing

00:00:06.384 --> 00:00:07.144
it into an

00:00:07.624 --> 00:00:10.784
AI model to further analyze the website to make

00:00:10.784 --> 00:00:12.104
sure it's a healthy website,

00:00:12.304 --> 00:00:14.544
make sure nothing's changed that you know you

00:00:14.544 --> 00:00:16.144
don't want to change like a product not being

00:00:16.144 --> 00:00:16.424
available.

00:00:16.904 --> 00:00:19.984
Now in order to do this we could go to OpenAI's

00:00:19.984 --> 00:00:22.184
API and we could use any number of their models.

00:00:22.184 --> 00:00:23.464
We could go to Anthropic,

00:00:23.804 --> 00:00:26.204
we could go to OpenRouter so we could proxy these

00:00:26.204 --> 00:00:29.884
requests via one provider to really any number of

00:00:29.884 --> 00:00:31.044
providers that we want to use,

00:00:31.044 --> 00:00:32.684
which is a really compelling product.

00:00:32.684 --> 00:00:33.084
But

00:00:33.404 --> 00:00:35.324
for this specific use case,

00:00:35.864 --> 00:00:38.084
we're actually going to be using Cloudflare's

00:00:38.084 --> 00:00:38.864
built in workers,

00:00:39.244 --> 00:00:39.803
AI,

00:00:40.124 --> 00:00:42.364
which is ultimately just a whole bunch of self

00:00:42.364 --> 00:00:45.244
hosted open source models that Cloudflare is

00:00:45.244 --> 00:00:47.644
hosting on their own GPUs all around the world.

00:00:48.284 --> 00:00:50.524
Now when I say like hosting some models,

00:00:50.524 --> 00:00:52.284
like they're hosting a ton of models and,

00:00:52.434 --> 00:00:54.954
and they're updating this every single time a new

00:00:54.954 --> 00:00:57.234
model drops that is like worth hosting.

00:00:57.234 --> 00:01:00.114
So today this went by OpenAI just barely dropped

00:01:00.114 --> 00:01:00.274
this,

00:01:00.274 --> 00:01:02.034
literally dropped today as of making this video.

00:01:02.354 --> 00:01:02.754
And

00:01:03.244 --> 00:01:05.194
they're hosting it now because this one is an

00:01:05.194 --> 00:01:06.074
open source model.

00:01:06.074 --> 00:01:06.434
Now

00:01:06.784 --> 00:01:08.954
there's a whole bunch of different tasks that you

00:01:08.954 --> 00:01:09.234
can do.

00:01:09.234 --> 00:01:10.994
For our use case we're just going to be doing text

00:01:10.994 --> 00:01:13.434
generation but they also have stuff for like text

00:01:13.434 --> 00:01:13.954
to image,

00:01:13.954 --> 00:01:14.834
image to text.

00:01:15.394 --> 00:01:16.714
You  can do like loras,

00:01:16.714 --> 00:01:17.074
you can.

00:01:17.074 --> 00:01:18.914
There's some models that have capabilities for

00:01:18.914 --> 00:01:19.794
function calling.

00:01:19.874 --> 00:01:22.754
Now the feature that we care the most about for

00:01:22.914 --> 00:01:23.794
our use case

00:01:24.254 --> 00:01:24.494
is

00:01:25.294 --> 00:01:26.334
JSON mode.

00:01:27.134 --> 00:01:28.934
Now when you're like kind of interfacing with

00:01:28.934 --> 00:01:29.454
ChatGPT,

00:01:29.934 --> 00:01:31.054
you can ask it a question.

00:01:31.054 --> 00:01:32.894
It gives you like this big text block.

00:01:32.894 --> 00:01:34.494
Now if you have this big text block,

00:01:34.654 --> 00:01:36.414
how do you actually use that in your system?

00:01:36.574 --> 00:01:39.414
Like how do you extract very specific key details

00:01:39.414 --> 00:01:39.774
about

00:01:40.814 --> 00:01:41.214
about

00:01:41.694 --> 00:01:43.054
the output of a model

00:01:43.374 --> 00:01:44.894
in a very reliable way?

00:01:45.534 --> 00:01:47.814
so essentially what OpenAI pioneered is they

00:01:47.814 --> 00:01:49.534
pioneered a specific schema

00:01:50.084 --> 00:01:53.004
that you can pass into a model to say I want you

00:01:53.004 --> 00:01:55.444
to answer this question or perform this task and I

00:01:55.444 --> 00:01:57.884
want your output to be in a JSON object of this

00:01:57.884 --> 00:01:58.724
specific type

00:01:59.114 --> 00:02:02.044
and then typically the model does a really good

00:02:02.044 --> 00:02:03.964
job at conforming to that type because I think

00:02:03.964 --> 00:02:04.884
they've trained on it.

00:02:04.884 --> 00:02:07.524
And then the provider also will typically like

00:02:07.604 --> 00:02:11.364
ensure that that type  comes back as expected.

00:02:11.604 --> 00:02:12.004
So

00:02:12.344 --> 00:02:14.524
there's kind of like two layers to it.

00:02:14.524 --> 00:02:16.924
But what that looks like in practice is you,

00:02:16.924 --> 00:02:18.484
you provide some system prompts.

00:02:18.484 --> 00:02:19.204
So you basically say,

00:02:19.204 --> 00:02:20.724
so extract data about a,

00:02:20.964 --> 00:02:23.474
about a country and then you give it like the

00:02:23.474 --> 00:02:24.114
user's input.

00:02:24.114 --> 00:02:25.874
So the user says tell me about India,

00:02:25.954 --> 00:02:26.354
right?

00:02:26.754 --> 00:02:27.634
And then

00:02:28.434 --> 00:02:31.514
along with the input from the user and from the

00:02:31.514 --> 00:02:31.794
system,

00:02:31.954 --> 00:02:32.834
so these messages,

00:02:32.834 --> 00:02:35.154
you're also going to be specifying a response

00:02:35.154 --> 00:02:35.674
format.

00:02:35.674 --> 00:02:38.434
So this is going to be a  JSON type.

00:02:38.434 --> 00:02:40.874
And then you can see the JSON schema looks like

00:02:40.874 --> 00:02:41.154
this.

00:02:41.234 --> 00:02:41.634
So

00:02:42.194 --> 00:02:43.314
it's going to be a type of

00:02:43.714 --> 00:02:45.954
object and then these are the properties inside of

00:02:45.954 --> 00:02:46.434
that object.

00:02:46.814 --> 00:02:47.454
You have name,

00:02:47.534 --> 00:02:48.254
you have capital,

00:02:48.414 --> 00:02:49.294
you have languages.

00:02:49.294 --> 00:02:50.894
And languages is an array,

00:02:50.894 --> 00:02:51.934
an array of strings.

00:02:52.174 --> 00:02:52.574
Capital

00:02:53.054 --> 00:02:54.094
is just a string,

00:02:54.094 --> 00:02:55.414
name is just a string.

00:02:55.414 --> 00:02:56.734
And then these are all required.

00:02:56.894 --> 00:02:58.694
So this is a very specific format.

00:02:58.694 --> 00:03:00.014
You could also do like enums.

00:03:00.014 --> 00:03:00.774
So it has to be like,

00:03:00.774 --> 00:03:01.614
of one type.

00:03:01.694 --> 00:03:02.094
And

00:03:02.564 --> 00:03:03.574
so this is a,

00:03:03.574 --> 00:03:06.494
this is kind of like the schema that OpenAI has

00:03:06.494 --> 00:03:07.694
pioneered and

00:03:08.174 --> 00:03:11.054
a lot of other models and also providers are kind

00:03:11.054 --> 00:03:13.054
of adhering to this format because so many people

00:03:13.054 --> 00:03:14.094
have already built out

00:03:15.134 --> 00:03:17.294
they've already built out like a lot of their

00:03:17.294 --> 00:03:17.614
system

00:03:17.934 --> 00:03:19.454
utilizing this format.

00:03:19.534 --> 00:03:19.934
So

00:03:20.494 --> 00:03:22.974
essentially think this data goes into the system

00:03:23.214 --> 00:03:26.094
and then the output of a model instead of this big

00:03:26.094 --> 00:03:28.254
block of text telling the user about India,

00:03:28.734 --> 00:03:30.814
what it's doing is it's telling that user specific

00:03:30.814 --> 00:03:31.454
things about India.

00:03:31.454 --> 00:03:33.174
So this is the response from a model.

00:03:33.174 --> 00:03:34.254
So the name is India,

00:03:34.254 --> 00:03:35.614
the capital is New Delhi.

00:03:35.694 --> 00:03:36.334
Languages,

00:03:37.214 --> 00:03:38.774
these are the languages spoken in India.

00:03:38.774 --> 00:03:40.334
There's a lot of languages spoken in India,

00:03:40.334 --> 00:03:41.134
which is pretty cool.

00:03:41.674 --> 00:03:44.294
and then for the specific feature of JSON mode,

00:03:44.294 --> 00:03:46.534
these are currently the models that are supported.

00:03:47.574 --> 00:03:48.254
and you know,

00:03:48.254 --> 00:03:49.494
I think most of these will do.

00:03:49.494 --> 00:03:51.534
You're going to get varied performance model to

00:03:51.534 --> 00:03:51.894
model.

00:03:51.894 --> 00:03:53.094
Some models are more expensive,

00:03:53.094 --> 00:03:54.334
more capable and slower.

00:03:54.334 --> 00:03:55.134
Some are fast,

00:03:55.134 --> 00:03:55.894
less capable,

00:03:55.974 --> 00:03:57.694
some have lower context windows,

00:03:57.694 --> 00:03:59.014
some have higher context windows.

00:03:59.014 --> 00:04:01.254
So it really just like depends on your use case.

00:04:01.254 --> 00:04:03.294
But we're going to play around with a few of them.

00:04:03.294 --> 00:04:05.014
And the good thing about workflows is you could

00:04:05.014 --> 00:04:05.334
like,

00:04:05.334 --> 00:04:05.894
you know,

00:04:05.894 --> 00:04:07.414
you could kind of a B test step.

00:04:07.414 --> 00:04:09.414
So you could say like one step is going to

00:04:09.934 --> 00:04:10.974
use one model,

00:04:10.974 --> 00:04:12.414
another step is going to use another model.

00:04:12.414 --> 00:04:14.233
And then you could do some like background

00:04:14.233 --> 00:04:15.313
processing to like

00:04:15.734 --> 00:04:18.113
compare the outputs of both to see like,

00:04:18.113 --> 00:04:18.353
you know,

00:04:18.353 --> 00:04:20.153
is there one model that performs a task better

00:04:20.153 --> 00:04:20.673
than another.

00:04:20.753 --> 00:04:22.673
So that's essentially what we're going to do is

00:04:22.673 --> 00:04:23.953
we're going to be using JSON mode,

00:04:23.953 --> 00:04:25.553
but instead of just like using,

00:04:26.033 --> 00:04:27.233
like stuffing that data,

00:04:27.534 --> 00:04:28.993
in that specific format

00:04:29.313 --> 00:04:29.713
into

00:04:30.113 --> 00:04:32.433
the worker entry point for the AI.

00:04:32.433 --> 00:04:34.273
We're actually going to be using a

00:04:35.313 --> 00:04:36.193
really popular,

00:04:37.073 --> 00:04:39.544
SDK that was built by Vercell called,

00:04:39.674 --> 00:04:41.224
the AI SDK.

00:04:41.544 --> 00:04:43.304
And what this does is this kind of like,

00:04:43.304 --> 00:04:45.304
provides a very generic class

00:04:45.864 --> 00:04:47.864
that allows you to interface with

00:04:48.424 --> 00:04:49.864
so many different models.

00:04:49.864 --> 00:04:50.584
Like they have,

00:04:50.744 --> 00:04:52.624
they literally have so many different providers

00:04:52.624 --> 00:04:53.624
that they're compatible with.

00:04:53.944 --> 00:04:56.184
And this just basically makes it so you're not

00:04:56.184 --> 00:04:56.664
like using,

00:04:57.064 --> 00:04:57.624
you know,

00:04:57.814 --> 00:05:02.344
OpenAI's SDK and Grox SDK and

00:05:02.954 --> 00:05:04.744
Deep Seq's SDK.

00:05:04.744 --> 00:05:07.384
I think Deep Seq actually uses OpenAI for their,

00:05:07.384 --> 00:05:08.024
their SDK.

00:05:08.024 --> 00:05:09.344
But you kind of get the point.

00:05:09.344 --> 00:05:09.504
Like,

00:05:09.504 --> 00:05:10.424
you're not like bringing

00:05:11.204 --> 00:05:11.364
things,

00:05:11.364 --> 00:05:12.364
you're creating a whole bunch of like,

00:05:12.364 --> 00:05:14.244
helper functions and then you're dynamically

00:05:14.244 --> 00:05:14.444
saying,

00:05:14.444 --> 00:05:14.644
okay,

00:05:14.644 --> 00:05:16.164
I want to call this function to use this model and

00:05:16.164 --> 00:05:17.084
this function to use this model.

00:05:17.084 --> 00:05:18.524
This just gives you one very,

00:05:18.524 --> 00:05:19.204
very clear,

00:05:20.244 --> 00:05:23.524
standard way of interfacing with tons of different

00:05:23.524 --> 00:05:24.044
providers.

00:05:24.044 --> 00:05:25.444
And this is going to make more sense as we get

00:05:25.444 --> 00:05:25.724
into it.

00:05:25.724 --> 00:05:26.804
If you're not familiar with this tool,

00:05:26.804 --> 00:05:28.924
but I really do think that you're going to like

00:05:28.924 --> 00:05:29.444
this tool,

00:05:29.474 --> 00:05:30.484
you're probably going to like,

00:05:30.484 --> 00:05:32.644
use this SDK for other projects in the future.

00:05:33.204 --> 00:05:33.604
Now,

00:05:36.004 --> 00:05:37.844
just before we actually get into the code,

00:05:37.844 --> 00:05:39.444
it might make sense to look at,

00:05:39.934 --> 00:05:43.064
to look at just like how you interface with,

00:05:44.264 --> 00:05:46.184
with the  worker AI bindings.

00:05:46.344 --> 00:05:48.744
So  this is just their basic documentation.

00:05:48.744 --> 00:05:50.104
You can see they're creating a project.

00:05:50.104 --> 00:05:52.304
But what I care about is I care about the binding.

00:05:52.304 --> 00:05:54.344
So in order to use bindings in your project,

00:05:54.504 --> 00:05:56.704
in order to access all these different models and

00:05:56.704 --> 00:05:57.344
different use cases,

00:05:57.344 --> 00:06:00.104
you literally just need to say in your Wrangler

00:06:00.104 --> 00:06:02.664
config AI and give it a binding.

00:06:03.064 --> 00:06:03.464
Then

00:06:03.944 --> 00:06:04.824
what you can do,

00:06:05.054 --> 00:06:07.784
inside of your worker is you can basically say,

00:06:07.784 --> 00:06:10.424
I want to go to the AI binding and I want to run.

00:06:10.894 --> 00:06:13.374
You pass in the specific model that you care about

00:06:13.614 --> 00:06:16.374
and then you pass in like a prompt or you pass in

00:06:16.374 --> 00:06:16.654
like,

00:06:17.114 --> 00:06:18.334
the actual like

00:06:19.374 --> 00:06:21.534
input with the system message and whatnot.

00:06:21.534 --> 00:06:22.814
So this is pretty cool.

00:06:22.814 --> 00:06:24.094
It's actually insanely,

00:06:24.294 --> 00:06:26.494
powerful that with just this like,

00:06:26.573 --> 00:06:28.174
very limited amount of code,

00:06:28.174 --> 00:06:30.094
you're able to do so much,

00:06:30.654 --> 00:06:32.294
you're able to use so many different models.

00:06:32.294 --> 00:06:34.094
So I do think that Cloudflare has built a pretty

00:06:34.094 --> 00:06:34.734
cool product here.

00:06:39.304 --> 00:06:40.264
So without further ado,

00:06:40.264 --> 00:06:41.944
let's get into this next section where we actually

00:06:41.944 --> 00:06:44.024
start building this out using Cloudflare workers

00:06:44.024 --> 00:06:44.584
AI.

