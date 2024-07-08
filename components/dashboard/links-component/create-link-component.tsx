import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { urlTest } from "@/lib/zod-schemas/url-zod-schema-simple";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useReducer } from "react";
import { Label } from "@/components/ui/label";

const formSchema = urlTest;

enum STATE_ACTIONS {
  SET_ERROR = "SET_ERROR",
  CLEAR_ERROR = "CLEAR_ERROR",
  SET_LONG_URL = "SET_LONG_URL",
  CLEAR_LONG_URL = "CLEAR_LONG_URL",
}

type State = {
  error: string | null;
  long_url: string | null;
};

type REDUCER_ACTION = {
  type: STATE_ACTIONS;
  payload?: Partial<State>;
};

const initialState: State = {
  error: null,
  long_url: null,
};

function reducer(state: State, action: REDUCER_ACTION): State {
  const { type, payload } = action;

  switch (type) {
    case STATE_ACTIONS.SET_LONG_URL:
      return { ...state, long_url: payload?.long_url || null };
    case STATE_ACTIONS.CLEAR_LONG_URL:
      return { ...state, long_url: null };
    case STATE_ACTIONS.SET_ERROR:
      return { ...state, error: payload?.error || null };
    case STATE_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

export function LinksComponent() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      long_url: "",
      antibot: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.antibot) {
      dispatch({
        type: STATE_ACTIONS.SET_ERROR,
        payload: { error: "Bots are not allowed." },
      });
      return;
    }

    let testURL = values.long_url.trim();
    if (!/^https?:\/\//.test(testURL)) {
      testURL = `https://${testURL}`;
    }

    console.log(testURL);

    // Further processing with the normalized URL
    dispatch({
      type: STATE_ACTIONS.SET_LONG_URL,
      payload: { long_url: testURL },
    });

    dispatch({ type: STATE_ACTIONS.CLEAR_ERROR });
  }

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="long_url"
            render={({ field }) => (
              <FormItem>
                <Label>Destination Link</Label>
                <FormControl>
                  <Input
                    type="text"
                    className="bg-muted"
                    placeholder="https://"
                    {...field}
                  />
                </FormControl>

                {form.formState.errors.long_url && (
                  <FormMessage className="h-6">
                    {form.formState.errors.long_url.message}
                  </FormMessage>
                )}
                {!form.formState.errors.long_url && <div className="h-6"></div>}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="antibot"
            render={({ field }) => (
              <FormItem className="hidden">
                <Label>Confirm</Label>
                <FormControl>
                  <Input type="text" className="bg-muted" {...field} />
                </FormControl>
                <FormDescription className="text-xs">Hm...</FormDescription>
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
          {state.error && (
            <span className="flex text-destructive h-6 truncate overflow-hidden whitespace-nowrap text-ellipsis min-w-0 max-w-265">
              <p>{state.error}</p>
            </span>
          )}
        </form>
      </Form>
    </div>
  );
}
