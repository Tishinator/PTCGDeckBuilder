import TemporalForces from '../data/pre-release-sets/TemporalForces.json'
import TwilightMasquerade from '../data/pre-release-sets/TwilightMasquerade.json';
import ShroudedFable from '../data/pre-release-sets/ShroudedFable.json';

const validFilters = ['name'];
const allSets = [TwilightMasquerade, ShroudedFable];

class PrereleaseCardFilter {
    static filter(filterParams){
        // External card set in assets
        let fullSet = [].concat(...allSets);
        // Results
        let filteredResults  = [];

        for(let card of fullSet){
            // console.log(fullSet)
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