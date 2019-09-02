import React, {Component} from 'react';

class PreloadImages extends Component {

    createPreloadImages = () => {
      const cardImages = [];
      ['C','S','D','H'].forEach(suit => {
          for(let i =2; i<10; i++){
              cardImages.push(<img rel="preload" src={`https://deckofcardsapi.com/static/img/${i}${suit}.png`}
                                   alt={`${i}${suit}`} key={`${i}${suit}`}/>);
          }
          cardImages.push(<img rel="preload" src={`https://deckofcardsapi.com/static/img/0${suit}.png`} alt={`0${suit}`}
                               key={`0${suit}`} />);
          cardImages.push(<img rel="preload" src={`https://deckofcardsapi.com/static/img/J${suit}.png`} alt={`J${suit}`}
                               key={`J${suit}`} />);
          cardImages.push(<img rel="preload" src={`https://deckofcardsapi.com/static/img/Q${suit}.png`} alt={`Q${suit}`}
                               key={`Q${suit}`} />);
          cardImages.push(<img rel="preload" src={`https://deckofcardsapi.com/static/img/K${suit}.png`} alt={`K${suit}`}
                               key={`K${suit}`} />);
          cardImages.push(<img rel="preload" src={`https://deckofcardsapi.com/static/img/A${suit}.png`} alt={`A${suit}`}
                               key={`A${suit}`} />);
      });

      return cardImages;
    };

    render() {
        return (
            <div id="preloadImages">
                {this.createPreloadImages()}
            </div>
        );
    }
}

export default PreloadImages;