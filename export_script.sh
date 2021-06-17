echo 'Getting items.json...'
wget https://fluxusfungus-api.herokuapp.com/items -O items.json
echo 'Extracting URLs...'
grep -o 'http[^"]*' items.json > urls_to_download.txt
echo 'Adding custom URLs...'
echo 'https://static.fluxusfungus.com/pulse.mp3' >> urls_to_download.txt
echo 'https://static.fluxusfungus.com/a%20po%C3%A9tica%20dos%20fungos.pdf' >> urls_to_download.txt
echo 'Downloading assets...'
mkdir tmp_3rd_assets
cd tmp_3rd_assets
wget -x -i ../urls_to_download.txt
echo 'Removing unused assets...'
rm -rf vimeo.com
cd ..
echo 'Replacing assets on public/static/3rd_assets...'
rm -rf public/static/3rd-assets
mv tmp_3rd_assets public/static/3rd-assets
echo 'Removing temporary files...'
rm items.json urls_to_download.txt

