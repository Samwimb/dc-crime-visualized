#################################################
# Import Dependencies
#################################################

import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Configure Database
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data/dc_crime_weather_db.sqlite"
db = SQLAlchemy(app)

Base = declarative_base()

# Set up classes
class Crime(Base):
    __tablename__ = 'crime_data'
    i = Column(Integer)
    X = Column(Float)
    Y = Column(Float)
    CCN = Column(String(255), primary_key=True)
    REPORT_DAT = Column(String(255))
    SHIFT = Column(String(255))
    METHOD = Column(String(255))
    OFFENSE = Column(String(255))
    BLOCK = Column(String(255))
    XBLOCK = Column(String(255))
    YBLOCK = Column(String(255))
    WARD = Column(Integer)
    ANC = Column(String(255))
    DISTRICT = Column(Integer)
    PSA = Column(Integer)
    NEIGHBORHOOD_CLUSTER = Column(String(255))
    BLOCK_GROUP = Column(String(255))
    CENSUS_TRACT = Column(Integer)
    VOTING_PRESINCT = Column(String(255))
    LATITUDE = Column(Float)
    LONGITUDE = Column(Float)
    BID = Column(String(255))
    START_DATE = Column(String(255))
    END_DATE = Column(String(255))
    OBJECTID = Column(String(255))
    OCTO_RECORD_ID = Column(String(255))
    DATE = Column(String(255))
    AVG = Column(Float)
    MAX = Column(Integer)
    MIN = Column(Integer)
    PctIllum = Column(Float)


#################################################
# Configure Routes
#################################################

@app.route("/")
def index():
    """Return the homepage."""
    # return render_template("index.html")
    return render_template("heatmap.html")
    # return render_template("heatmap2.html")


@app.route("/crime/<date>")
def sample_metadata(date):
    """Return the MetaData for a given sample."""
    sel = [
        Crime.LATITUDE,
        Crime.LONGITUDE,
        Crime.REPORT_DAT,
        Crime.OFFENSE,
        Crime.AVG,
        Crime.MAX,
        Crime.MIN,
        Crime.ILLUM
    ]

    results = db.session.query(*sel).filter(Crime.REPORT_DAT.like(f"{date}%")).all()

    geo_json = {"type": "FeatureCollection", "features": []}

    for result in results:
        event = {"type": "Feature",
                    "geometry": {"type": "Point",
                                 "coordinates": [result[0], result[1]]
                    },
                    "properties": {"report_date": result[2],
<<<<<<< HEAD
                                   "offense": result[3],
                                   "weather": {"temp_avg": result[4],
                                               "temp_max": result[5],
                                               "temp_min": result[6],
                                               "lunar_illum": result[7]
                                   }
=======
                                   "offense": result[3]
>>>>>>> origin/flask-test-sw
                    }
                }

        geo_json["features"].append(event)

    # print(geo_json)

    return jsonify(geo_json)


#################################################
# Start App
#################################################

if __name__ == "__main__":
    app.run()
