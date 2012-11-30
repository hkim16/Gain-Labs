# -*- coding: utf-8 -*-
# <nbformat>3.0</nbformat>

# <codecell>

import ujson
import urllib2
import pandas as pd
import sys
import os
import pickle

def WB_data_grab(indicator,years=[1995,2012],return_names=False):
    """
    Fetch from data.worldbank.org the latest data for the given Indicator code.
    - By default it returns values from 1995 to 2012. 
        If given more year pagination might be a problem
    - If used with the keyword return_names=True is will return a dictionary with 
        all metadata for all countries


    """
    #Construct the WB API URL
    DATA_url='http://api.worldbank.org/countries/all/indicators/'+\
     indicator+'?date='+str(int(years[0]))+':'+str(int(years[1]))+'&format=json&per_page=9999'
    #Fetch the response and parse the JSON
    req = urllib2.urlopen(DATA_url)
    json_req=ujson.load(req)

    #Make it a matrix with the right shape ISO2 x year x measure 
    matrix=pd.DataFrame(json_req[1])
    if return_names is True:
        print "Reading country metadata"
        local_cache="WB_country_metadata.pck"
        if os.path.isfile(local_cache):
            f=open(local_cache,"r") 
            print "Using local cached file"
            names = pickle.load(f)
            f.close()
            del f

        else:
            print "local cache not present. Fetching data..."
            names=matrix
            names['ISO2']=matrix['country'].apply(lambda x: x.get('id','None'))
            names['country']=matrix['country'].apply(lambda x: x.get('value','None'))
            a=names.drop_duplicates(cols='ISO2',inplace=True)
            n= dict(zip(names['ISO2'].values,names['country']))
            names={}
            for i in n:
                names[i]={'name':n[i]}
            
            for country in names:
                #Construct the WB API URL for COUNTRY
                DATA_url='http://api.worldbank.org/countries/'+country+'?format=json&per_page=9999'
                #Fetch the response and parse the JSON
                req = urllib2.urlopen(DATA_url)
                json_req=ujson.load(req)
                country_data=json_req[1]

                for country_item in country_data:
                    for country_value in country_item:
                        names[country][country_value]=country_item[country_value]
            
            for country in names.keys():
                #Adding ISO2 as parameter
                names[country]['ISO2']=country
                #replacing ISO3 instead of ISO2
                names[names[country]['id']]=names[country]
                del names[country]
            f = open(local_cache, "w") # write mode
            pickle.dump(names, f)
            f.close()
            del f
        return names
    else:
        matrix['ISO2']=matrix['country'].apply(lambda x: x.get('id','None'))
        matrix = matrix.pivot(index='ISO2',columns='date',values='value')
        
        #replace ISO2 with ISO3
        names=WB_data_grab_names()
        renames={}
        for key in names:
                renames[names[key]['ISO2']]=key
                matrix=matrix.rename(renames)
        
        return matrix
   
def WB_data_grab_names():
    """
    Fetch from data.worldbank.org the latest meta data  for all countries
    wrapper for main function
    """
    #not important which indicator is chosen. Names are always the same
    indicator="BN.KLT.DINV.CD"
    names=WB_data_grab(indicator,return_names=True)
    return names

