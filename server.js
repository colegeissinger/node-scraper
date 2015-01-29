var express    = require( 'express' ),
	fs         = require( 'fs' ),
	request    = require( 'request' ),
	cheerio    = require( 'cheerio' ),
	async      = require( 'async' ),
	json       = require( './urls.json' ),
	app        = express();

app.get( '/scrape', function( req, res ) {
	async.times( json.URL.length, function( i, callback ) {
		var options = {
			url: json.URL[i],
			headers: {
				'User-Agent'   : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0',
				'Content-Type' : 'application/x-www-form-urlencoded'
			}
		};

		request( options, function( error, response, html ) {
			// Return early if an error occurs
			if ( error && response.statusCode !== 200 ) {
				res.send( 'Error occured: ' + error );
				this.exit();
			}

			console.log( 'Processing ' + options.url );

			// Define our data object for storing page information
			var data     = {
					url : options.url,
					postTitle : '',
					featImage : '',
					content : ''
				},
				$        = cheerio.load( html ),
				$content = $( '#content' );

			// Fetch our post title
			$content.find( '.entry-title' ).filter( function() {
				data.postTitle = $( this ).text();
			} );

			// Fetch the image
			$content.find( '.entry-content > div > img' ).filter( function() {
				data.featImage = $( this ).attr( 'src' );
			} );

			// Get the content. All of it minus the header
			$content.find( '.entry-content' ).filter( function() {
				data.content = $( this ).html();
			} );

			// Collects each request and passes it to the callback below via "results"
			callback( null, data );
		} );
	},

	/**
	 * Call back function for each request
	 *
	 * @param error
	 * @param results
	 */
	function( error, results ) {
		fs.writeFile( 'output.json', JSON.stringify( results ), function( error ) {
			console.log( 'File successfully written! - Check your project directory for the output.json file' );
		} );

		res.send( 'Done!' );
	} );

} );

app.listen( '8081' );

console.log( 'Listening on port 8081' );

exports = module.exports = app;