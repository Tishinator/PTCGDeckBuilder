import TemporalForces from '../data/pre-release-sets/TemporalForces.json'

const validFilters = ['name'];

class PrereleaseCardFilter {
    static filter(filterParams){
        // External card set in assets
        let fullSet = TemporalForces;
        // Results
        let filteredResults  = [];

        for(let card of fullSet){
            console.log(fullSet)
            for(let filter in filterParams){
                if (validFilters.includes(filter)) {
                    if((card[filter].toLowerCase()).includes((filterParams[filter].toLowerCase()))){
                        filteredResults.push(card);
                        break;
                    }
                }
            }
        }
        return filteredResults;
    }
}

export default PrereleaseCardFilter;