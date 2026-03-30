/**
 * MSW Server Instance for Tests
 * Author: Ahmed Adel Bakr Alderai
 */

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
