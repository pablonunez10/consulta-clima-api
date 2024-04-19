import axios from 'axios'
 import {z} from 'zod'
// import {object, string, number, parse, Output   } from 'valibot'
import { SearchType } from '../types'
import { useState, useMemo } from 'react'
        //TYPE GUARDS
// function isWeatherResponse(weather : unknown) : weather is Weather {
//     return (
//         Boolean(weather) && 
//         typeof weather === 'object' &&
//         typeof (weather as Weather).name === 'string' &&
//         typeof (weather as Weather).main.temp === 'number' && 
//         typeof (weather as Weather).main.temp_max === 'number' &&
//         typeof (weather as Weather).main.temp_min === 'number' 
//     )
// }

//Zod
const Weather = z.object({
    name: z.string(),
    main: z.object({
        temp:z.number(),
        temp_max:z.number(),
        temp_min:z.number()
    })
})
export type Weather = z.infer<typeof Weather>

//Valibot
// const WeatherSchema = object({
//     name: string(),
//     main: object({
//         temp: number(),
//         temp_max: number(),
//         temp_min: number()
//     }),
// })
// type Weather = Output<typeof WeatherSchema>

const initialState = {
    name: '',
    main: {
        temp: 0,
        temp_max: 0,
        temp_min: 0,
    }
}
export default function useWeather () {
    const [weather, setWeather] = useState<Weather>(initialState)
    const [loading, setLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)
    const fetchWeather = async(search : SearchType) => {
        const appId = import.meta.env.VITE_API_KEY
        setLoading(true)
        setWeather(initialState)
        try {
          const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}` 
          const {data} = await axios(geoUrl) //el metodo que trae por default es el get
          //Comprobar
          if (!data[0]) {
            setNotFound(true)
            return
          }
          const lat = data[0].lat
          const lon = data[0].lon
          const weatherUrl =`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`
        
        //CASTEAR EL TYPE
        //   const {data: weatherUrlResult} = await axios<Weather>(weatherUrl)
        //   console.log(weatherUrlResult.main.temp)
        //   console.log(weatherUrlResult.name)
          // console.log(weatherUrlResult.main.temp)
        // console.log(weatherUrlResult.name)
        
        //TYPE GUARDS
        // const {data: weatherResult} = await axios(weatherUrl)
        // const result = isWeatherResponse(weatherResult)
        // if(result) {
        //     console.log(weatherResult.name)
        // } else {
        //     console.log('no hay rp')
        // }

        //ZOD
        const {data: weatherResult} = await axios(weatherUrl)
        const result = Weather.safeParse(weatherResult)
        if (result.success) {
            setWeather(result.data)
        } else {
            console.log('ta mal')
        }

        //Valibot
        // const {data: weatherResult} = await axios(weatherUrl)
        // const result = parse(WeatherSchema, weatherResult )
        // if (result) {
        //     console.log(result.name)
        //     console.log(result.main.temp)
        // }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }
    const hasWeatherData = useMemo(() => weather.name, [weather])
    return {
        weather,
        loading,
        notFound,
        fetchWeather,
        hasWeatherData
    }
}