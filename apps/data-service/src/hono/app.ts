import { Hono } from 'hono';

export const App = new Hono<{ Bindings: Env }>();


App.get('/:id', async (c) => {
    console.log(JSON.stringify(c.req.raw.cf))
    const cf = c.req.raw.cf
    const country = cf?.country
    const lat = cf?.latitude
    const long = cf?.longitude
    return c.json({
        country,
        lat,
        long
    })
})
