## Unit Tests

### HTTP Request Handler
#### Requirements
Dependency requirements:
```
Nodejs Modules:
newman
```

Data requirements:
There should be at least two wisps in the database for this test to fully function.

#### Testing

To run unit test for HTTP Request Handler, execute following command (e.g. running L1_test.json):
```bash
newman run L1_test.json --delay-request 50 --reporters cli
```

If you wish to output a HTML file that is friendly to Assembla, use this command instead:
```bash
newman run L1_test.json --delay-request 50 --reporters cli,html --reporter-html-template output_templates/assembla.hbs
```

#### Tools

To edit the unit testing using a GUI tool. Open [Postman](https://www.getpostman.com/), and import the `L1_test.json` or `L2_test.json` file as a collection.
