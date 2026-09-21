import {config,json} from "@/lib/ai";
export function GET(){return json({configured:Boolean(config().key)});}
