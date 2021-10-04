import S3 from 'aws-sdk/clients/s3';

const bucket: string = process.env.BUCKET_NAME || '';

const s3 = new S3({
  region: process.env.AWS_REGION || 'eu-north-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

export const enable = (key: string, simulation: any) => {
  return s3
    .putObject({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify({
        type: simulation.type,
        ...simulation.properties,
      }),
    })
    .promise();
};

export const disable = (key: string) => {
  return s3
    .putObject({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify({}),
    })
    .promise();
};
