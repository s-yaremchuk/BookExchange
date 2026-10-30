import { app } from './app';
import { env } from './config/env';
import { scheduleUploadCleanup } from './modules/books/uploadCleanup.service';

app.listen(env.PORT, () => {
  scheduleUploadCleanup();
});
