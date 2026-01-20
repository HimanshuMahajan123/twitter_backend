import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'
import { trendsService } from '../services/TrendsService.js'
const Trends = () => {
    const [trends, setTrends] = useState([]);
    useEffect(async () => {
        const response = await trendsService.getTrends();
        setTrends(response.data.trendingPosts);

    }, []);


  return (
    <div>
        <ul>
          {
            trends.map((trend, index) => (
              <li key={index}>
                <span>{trend.text}... </span>
              </li>
            ))
          }
        </ul>


    </div>
  )
}

export default Trends