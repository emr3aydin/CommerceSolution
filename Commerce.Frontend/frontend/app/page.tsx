"use client"
import { useState, useEffect } from "react"


export default function Home() {
  const [weathers , setWeathers] = useState<any[]>([]);
  const [loading , setLoading] = useState(true);
  const [error , setError] = useState<string | null>(null);

  useEffect(()=>{
    const apiURL="https://localhost:7057/WeatherForecast"
    const fetchProducts = async () =>{
      try{
      const response = await fetch(apiURL)
      console.log(response)
        const weathers = await response.json()
        setWeathers(weathers)

      }
      catch(e:any){
        setError(e.message)
      }
    }

    fetchProducts()



  }, [])

  if(error){
    return(
      <div>
      HATA ALINDI<br></br>
      {error}
      </div>
      
    )
  }
  return(
    <div>
      <h1>Liste:</h1>
      <ul>
        {weathers.map(weather =>(
          <li key={weather.date}>
            {weather.date} - SıcaklıkC {weather.temperatureC} - SıcaklıkF {weather.temperatureF}
          </li>
        ))}
      </ul>
    </div>
  )


}
